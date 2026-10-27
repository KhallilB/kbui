import { normalizeCatalogLocation } from "../../catalog-location";

const { url } = normalizeCatalogLocation(new URL(window.location.href));
window.location.replace(url.href);
