import { writable, get } from 'svelte/store';
import type { SvelteComponent } from 'svelte';

// Type for route parameters
export interface RouteParams {
  [key: string]: string;
}

// Type for the location object
export interface Location {
  path: string;
  params: RouteParams;
  query: URLSearchParams;
}

// Current location store
export const location = writable<Location>({
  path: '/',
  params: {},
  query: new URLSearchParams(),
});

// Navigation history stack
const historyStack: string[] = ['/'];
let currentIndex = 0;

// Helper to parse query string
export const querystring = writable<string>('');

// Parse path and params
function parseRoute(path: string, routePattern: string): RouteParams | null {
  // Convert route pattern to regex
  // e.g. /users/:id -> /^\/users\/([^/]+)$/
  const paramNames: string[] = [];
  const regexPath = routePattern.replace(/:([^/]+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });

  const regex = new RegExp(`^${regexPath}$`);
  const match = path.match(regex);

  if (!match) return null;

  const params: RouteParams = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });

  return params;
}

export function push(url: string) {
  // Handle relative paths or simple navigation
  const [path, search] = url.split('?');

  historyStack.splice(currentIndex + 1);
  historyStack.push(url);
  currentIndex++;

  updateLocation(url);
}

export function replace(url: string) {
  historyStack[currentIndex] = url;
  updateLocation(url);
}

export function pop() {
  if (currentIndex > 0) {
    currentIndex--;
    updateLocation(historyStack[currentIndex]);
  }
}

export function link(node: HTMLAnchorElement) {
  const href = node.getAttribute('href');

  function onClick(e: MouseEvent) {
    e.preventDefault();
    if (href) push(href);
  }

  node.addEventListener('click', onClick);

  return {
    destroy() {
      node.removeEventListener('click', onClick);
    }
  };
}

function updateLocation(url: string) {
  const [path, search] = url.split('?');
  const query = new URLSearchParams(search || '');

  location.update(loc => ({
    ...loc,
    path,
    query,
  }));

  querystring.set(search || '');
}

// Export a way to match routes
export function matchRoute(currentPath: string, routes: Record<string, any>): { component: any; params: RouteParams } | null {
  // Exact match
  if (routes[currentPath]) {
    return { component: routes[currentPath], params: {} };
  }

  // Pattern match
  for (const [pattern, component] of Object.entries(routes)) {
    const params = parseRoute(currentPath, pattern);
    if (params) {
      return { component, params };
    }
  }

  // 404/Default handling could be added here
  // For now return null or maybe root if configured
  return null;
}
