import sidebarConfig from "@/config/sidebar.json";

export interface SidebarItem {
  label: string;
  slug?: string;
  href?: string;
  items?: SidebarItem[];
  type: "link" | "group";
  isCurrent?: boolean;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

function processItem(item: any, currentPath: string): SidebarItem {
  if (item.slug !== undefined) {
    const href = item.slug === "" ? "/" : `/${item.slug}/`;
    return {
      label: item.label,
      slug: item.slug,
      href,
      type: "link",
      isCurrent: currentPath === href || currentPath === `/${item.slug}`,
    };
  }

  if (item.items) {
    return {
      label: item.label,
      type: "group",
      items: item.items.map((subItem: any) => processItem(subItem, currentPath)),
    };
  }

  return {
    label: item.label,
    type: "link",
    href: item.href || "#",
    isCurrent: false,
  };
}

export function getSidebar(currentPath: string): SidebarGroup[] {
  const sidebar = sidebarConfig.main || [];

  return sidebar.map((group: any) => ({
    label: group.label,
    items: (group.items || []).map((item: any) => processItem(item, currentPath)),
  }));
}

export function flattenSidebar(items: SidebarItem[]): SidebarItem[] {
  return items.flatMap((item) =>
    item.type === "group" && item.items ? flattenSidebar(item.items) : item
  );
}

export function hasActiveEntry(item: SidebarItem, currentPath: string): boolean {
  if (item.href === currentPath) {
    return true;
  }
  if (item.items) {
    return item.items.some((subItem) => hasActiveEntry(subItem, currentPath));
  }
  return false;
}
