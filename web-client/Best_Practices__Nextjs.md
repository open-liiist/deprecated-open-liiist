# web-client: Best Practices for Next.js

>Follow these best practices for clean, scalable, and maintainable code.

## Folder Structure

```
/components
  /common      → Reusable components
  /forms       → Form-related components
  /layout      → UI structure (Header, Footer, etc.)
  /list        → list management components
  /map         → Map-related components
  /pages       → Page-specific components
  /products    → Product-related components
  /utils       → Utility functions & configs
```

---

## Naming Conventions

| Type        | Format                  | Example                   |
| ----------- | ----------------------- | ------------------------- |
| Components  | `PascalCase.tsx`        | `ProductGrid.tsx`         |
| CSS Modules | `kebab-case.module.css` | `product-list.module.css` |
| Utilities   | `camelCase.ts`          | `fetchProducts.ts`        |
| Hooks       | `useCamelCase.ts`       | `useFetch.ts`             |

---

## Imports & `index.ts`

Use a single `index.ts` in `/components/` for cleaner imports.

```ts
export { default as Button } from "./common/Button";
export { default as Header } from "./layout/Header";
export { default as ProductGrid } from "./products/ProductGrid";
```

Now import easily:

```ts
import { Button, Header, ProductGrid } from "@/components";
```

---

## Optimization

- Use `getServerSideProps` only if data changes frequently.
- Use `getStaticProps` with `revalidate` for rarely changing data.
- Keep API logic separate in `/pages/api/`.
- Optimize images using `next/image`:
  ```tsx
  <Image src="/image.jpg" width={500} height={300} alt="Description" />
  ```
- Load components dynamically:
  ```tsx
  const Map = dynamic(() => import("@/components/map/Map"), { ssr: false });
  ```
- Avoid unnecessary re-renders by using `useRef` or `useReducer` when possible.

---

##  UI & Styling

- Use CSS Modules or Tailwind.
- Stick to `component-name.module.css` pattern.
- Write accessible, semantic HTML (`<button>`, `<label>`).

---

## Code Guidelines

```tsx
export default function Example() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/data").then((res) => res.json()).then(setData);
  }, []);
  return <div>{data ? JSON.stringify(data) : "Loading..."}</div>;
}
```

 >**Keep components small & reusable.**\
 **Avoid inline functions in JSX.**\
 **Use TypeScript for better maintainability.**\
 **Use Prettier & ESLint for formatting.**

---

## PR Checklist

 Follow naming conventions?\
 Modular & reusable components?\
 No business logic in frontend?\
 Performance optimizations applied?\
 Accessible & semantic code?


> Following these best practices keeps the project scalable & maintainable! 

- [Next.js documentation](https://nextjs.org/docs)
- [Mastering Next.js: Best Practices for Clean, Scalable, and Type-Safe Development](https://medium.com/%40PedalsUp/mastering-next-js-best-practices-for-clean-scalable-and-type-safe-development-626257980e60)
