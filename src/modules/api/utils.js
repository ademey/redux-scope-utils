

export const scopeTypeDescriptors = (request, success, failure, scope) =>
  [request, success, failure].map(item => {
    if (typeof item === 'string') {
      return {
        type: item,
        meta: { scope }
      };
    }

    if (typeof item === 'object') {
      return {
        ...item,
        meta: {
          ...item.meta,
          scope
        }
      };
    }

    return new Error('Type must be an object or string');
  });