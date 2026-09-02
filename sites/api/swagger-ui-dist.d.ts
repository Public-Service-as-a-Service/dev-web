// swagger-ui-dist levererar inga typdeklarationer. Vi använder bara
// SwaggerUIBundle och dess presets, så deklarationen hålls minimal.
declare module 'swagger-ui-dist' {
  interface SwaggerUIBundleFn {
    (options: Record<string, unknown>): unknown;
    presets: { apis: unknown };
  }
  export const SwaggerUIBundle: SwaggerUIBundleFn;
}

declare module 'swagger-ui-dist/swagger-ui.css';
