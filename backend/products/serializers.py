# products/serializers.py
from rest_framework import serializers
from .models import Product, Category, ProductImage, EventExtension, UPCOMING_CATEGORY_ID, PAST_CATEGORY_ID
from django.utils.text import slugify
from django.conf import settings
from django.utils import timezone
from cloudinary.utils import cloudinary_url


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "product", "image", "alt", "order"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        image = instance.image

        if image and hasattr(image, "public_id"):
            # ✅ Cloudinary optimized URL (WebP + smart compression)
            url, _ = cloudinary_url(
                image.public_id,
                format="webp",
                quality="auto:good",
                fetch_format="auto"
            )
            data["image"] = url
        else:
            data["image"] = None

        return data


class EventExtensionSerializer(serializers.ModelSerializer):
    start = serializers.DateTimeField()
    end = serializers.DateTimeField(required=False, allow_null=True)
    location = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = EventExtension
        fields = ["start", "end", "location", "created_at"]
        read_only_fields = ["created_at"]


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    images = ProductImageSerializer(many=True, read_only=True)
    category_obj = serializers.SerializerMethodField()
    event_data = EventExtensionSerializer(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "category",
            "category_obj",
            "is_active",
            "sales_count",
            "price",
            "discounted_price",
            "cost",
            "stock",
            "attributes",
            "trending",
            "images",
            "event_data",
        )
        read_only_fields = ("slug", "sales_count")

    def get_category_obj(self, obj):
        cat = obj.category
        if not cat:
            return None
        return {
            "id": cat.id,
            "name": cat.name,
            "parent": cat.parent.id if cat.parent else None,
            "parent_name": cat.parent.name if cat.parent else None,
        }

    def validate(self, attrs):
        if attrs.get("is_active") and attrs.get("stock", 0) <= 0:
            raise serializers.ValidationError("Cannot activate a product with zero stock.")
        return attrs

    def _determine_event_category_id(self, event_data):
        now = timezone.now()

        end = event_data.get("end")
        start = event_data.get("start")

        if end and end < now:
            return PAST_CATEGORY_ID
        if start and start < now:
            return PAST_CATEGORY_ID

        return UPCOMING_CATEGORY_ID

    def create(self, validated_data):
        event_data = validated_data.pop("event_data", None)

        if not validated_data.get("slug"):
            validated_data["slug"] = slugify(validated_data.get("title", ""))

        if event_data:
            try:
                cat_id = self._determine_event_category_id(event_data)
                validated_data["category"] = Category.objects.get(pk=cat_id)
            except Category.DoesNotExist:
                pass

        product = super().create(validated_data)

        if event_data:
            EventExtension.objects.create(product=product, **event_data)

        return product

    def update(self, instance, validated_data):
        event_data = validated_data.pop("event_data", None)

        if "title" in validated_data and not validated_data.get("slug"):
            validated_data["slug"] = slugify(validated_data["title"])

        if event_data:
            try:
                cat_id = self._determine_event_category_id(event_data)
                validated_data["category"] = Category.objects.get(pk=cat_id)
            except Category.DoesNotExist:
                pass

        product = super().update(instance, validated_data)

        if event_data:
            if hasattr(product, "event_data"):
                for k, v in event_data.items():
                    setattr(product.event_data, k, v)
                product.event_data.save()
            else:
                EventExtension.objects.create(product=product, **event_data)

        return product


class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["slug"]

    def get_image_url(self, obj):
        if obj.image and hasattr(obj.image, "public_id"):
            url, _ = cloudinary_url(
                obj.image.public_id,
                format="webp",
                quality="auto:good",
                fetch_format="auto"
            )
            return url
        return None

    def create(self, validated_data):
        validated_data["slug"] = slugify(validated_data["name"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "name" in validated_data:
            validated_data["slug"] = slugify(validated_data["name"])
        return super().update(instance, validated_data)
