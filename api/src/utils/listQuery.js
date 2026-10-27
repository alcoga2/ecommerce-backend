const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const badRequest = (field, message) => {
  const error = new Error('Parámetros de consulta no válidos');
  error.statusCode = 400;
  error.code = 'BAD_REQUEST';
  error.details = [{ field, message }];
  return error;
};

const parsePositiveInteger = (value, field, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
    throw badRequest(field, 'Debe ser un entero positivo');
  }
  return Number(value);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseListQuery = (query, allowedSortFields) => {
  const filter = {};
  if (query.active !== undefined) {
    if (query.active !== 'true' && query.active !== 'false') {
      throw badRequest('active', 'Debe ser true o false');
    }
    filter.active = query.active === 'true';
  }

  if (query.name !== undefined) {
    if (typeof query.name !== 'string') throw badRequest('name', 'Debe ser texto');
    const name = query.name.trim();
    if (name) filter.name = { $regex: escapeRegex(name), $options: 'i' };
  }

  let sort = { name: 1 };
  if (query.sort !== undefined) {
    if (typeof query.sort !== 'string') throw badRequest('sort', 'Debe indicar un único campo permitido');
    const direction = query.sort.startsWith('-') ? -1 : 1;
    const field = query.sort.replace(/^[+-]/, '');
    if (!allowedSortFields.includes(field)) {
      throw badRequest('sort', `Campo permitido: ${allowedSortFields.join(', ')}`);
    }
    sort = { [field]: direction };
  }

  const page = parsePositiveInteger(query.page, 'page', DEFAULT_PAGE);
  const requestedLimit = parsePositiveInteger(query.limit, 'limit', DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);

  return { filter, sort, page, limit, skip: (page - 1) * limit };
};

module.exports = { parseListQuery, MAX_LIMIT };
