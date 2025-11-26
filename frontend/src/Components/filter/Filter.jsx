// src/components/filter/Filter.jsx
import React, { useEffect, useState } from "react";
import { Accordion, ListGroup, Spinner } from "react-bootstrap";
import { fetchCategories } from "../../api";

const Filter = ({ onSelectCategory, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openParent, setOpenParent] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!alive) return;

        // Defensive: ensure array
        const flat = Array.isArray(data) ? data : data.results || [];

        // identify parent categories (those without a parent)
        const parents = flat.filter((cat) => !cat.parent);

        // helper to normalize parent id (parent may be null, number or object)
        const parentIdOf = (c) =>
          c && typeof c === "object" && "id" in c ? c.id : c;

        // collect children by parent id
        const children = flat.filter((cat) => !!cat.parent);

        // attach subcategories under each parent, comparing ids robustly
        const structured = parents.map((parent) => ({
          ...parent,
          subcategories: children.filter(
            (child) => parentIdOf(child.parent) === parent.id
          ),
        }));

        setCategories(structured);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Auto-open the parent if a subcategory is selected; close when selection cleared
  useEffect(() => {
    if (!selectedCategory) {
      setOpenParent(null);
      return;
    }

    // selectedCategory may be an object like { id, isParent, slug, name }
    if (typeof selectedCategory === "object") {
      // If it's a parent selection, open that parent
      if (selectedCategory.isParent) {
        setOpenParent(selectedCategory.id);
        return;
      }

      // Otherwise find which parent contains this child
      const parentWithChild = categories.find((cat) =>
        (cat.subcategories || []).some((sub) => sub.id === selectedCategory.id)
      );
      if (parentWithChild) setOpenParent(parentWithChild.id);
    } else {
      // if it's a raw id, try to find its parent
      const parentWithChild = categories.find((cat) =>
        (cat.subcategories || []).some((sub) => sub.id === selectedCategory)
      );
      if (parentWithChild) setOpenParent(parentWithChild.id);
    }
  }, [selectedCategory, categories]);

  if (loading)
    return (
      <div className="py-3 text-center">
        <Spinner animation="border" size="sm" />
      </div>
    );

  const isActive = (id, isParent = false) => {
    if (!selectedCategory) return false;
    // selectedCategory may be an object we created earlier
    if (typeof selectedCategory === "object") {
      return (
        selectedCategory.id === id && selectedCategory.isParent === isParent
      );
    }
    // or it may be a raw id (fallback)
    return selectedCategory === id && isParent === false;
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Categories</h5>

      <ListGroup variant="flush">
        {/* All products option */}
        <ListGroup.Item
          action
          onClick={() => onSelectCategory(null)} // null means show all
          active={!selectedCategory}
          className="fw-semibold"
        >
          🛍 All Products
        </ListGroup.Item>
      </ListGroup>

      <Accordion activeKey={openParent ? openParent.toString() : null}>
        {categories.map((cat) => (
          <Accordion.Item
            eventKey={cat.id.toString()}
            key={cat.id}
            className="border-0"
          >
            <Accordion.Header
              onClick={() =>
                setOpenParent((prev) => (prev === cat.id ? null : cat.id))
              }
            >
              {cat.name}
            </Accordion.Header>

            <Accordion.Body className="p-0">
              <ListGroup variant="flush">
                <ListGroup.Item
                  action
                  onClick={() =>
                    onSelectCategory({
                      id: cat.id,
                      isParent: true,
                      slug: cat.slug,
                      name: cat.name,
                    })
                  }
                  active={isActive(cat.id, true)}
                  className="fw-semibold"
                >
                  All {cat.name}
                </ListGroup.Item>

                {cat.subcategories?.map((sub) => (
                  <ListGroup.Item
                    key={sub.id}
                    action
                    onClick={() =>
                      onSelectCategory({
                        id: sub.id,
                        isParent: false,
                        slug: sub.slug,
                        name: sub.name,
                      })
                    }
                    active={isActive(sub.id, false)}
                    className="ps-4 small"
                  >
                    {sub.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

export default Filter;
