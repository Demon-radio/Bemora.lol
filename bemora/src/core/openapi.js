/**
 * Auto-generate a minimal OpenAPI 3.0 spec describing every namespace/method
 * exposed on a Bemora instance. Useful when someone wraps bemora in a REST API.
 *
 * @param {Object} api - a constructed Bemora instance
 * @param {{ basePath?: string, title?: string, version?: string }} opts
 * @returns {Object} OpenAPI 3.0 document
 */
export function generateOpenAPISpec(api, { basePath = '/api/v1', title = 'Bemora API', version = '1.0.0' } = {}) {
  const paths = {};
  const internalKeys = new Set([
    '_keys', '_options', '_events', '_plugins', '_monitor',
    'interceptors', 'middleware', 'registry', 'cache', 'export', 'monitor',
  ]);

  for (const [namespace, value] of Object.entries(api)) {
    if (namespace.startsWith('_') || internalKeys.has(namespace)) continue;
    if (typeof value !== 'object' || value === null) continue;

    for (const [method, fn] of Object.entries(value)) {
      if (typeof fn !== 'function') continue;
      const route = `${basePath}/${namespace}/${method}`;
      paths[route] = {
        post: {
          operationId: `${namespace}_${method}`,
          summary: `Call bemora.${namespace}.${method}(params)`,
          tags: [namespace],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: { type: 'object', additionalProperties: true },
                },
              },
            },
            500: { description: 'Provider or upstream error' },
          },
        },
      };
    }
  }

  return {
    openapi: '3.0.3',
    info: { title, version, description: 'Auto-generated from the live Bemora instance method registry.' },
    servers: [{ url: basePath }],
    paths,
  };
}
