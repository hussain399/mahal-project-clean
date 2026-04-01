export const resolveIdentity = () => {
  const rawRole = (localStorage.getItem("role") || "").toLowerCase();
  const linkedId = localStorage.getItem("linked_id");

  const role =
    rawRole.includes("admin") ? "admin" :
    rawRole.includes("supplier") ? "supplier" :
    rawRole.includes("restaurant") ? "restaurant" :
    rawRole.includes("delivery") ? "delivery" :
    null;

  if (!role) return null;

  if (role === "admin") {
    return { role };
  }

  if (!linkedId || isNaN(linkedId)) {
    return null;
  }

  return {
    role,
    linkedId: Number(linkedId)
  };
};
