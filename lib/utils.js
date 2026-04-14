function paginate(req, items, collectionName) {
  const pageSize = Math.min(1000, Math.max(1, Number(req.query.PageSize || req.query.page_size || 50)));
  const page = Math.max(0, Number(req.query.Page || req.query.page || 0));
  const total = items.length;
  const start = page * pageSize;
  const end = Math.min(total, start + pageSize);
  const pageItems = items.slice(start, end);
  const baseUri = `${req.path}`;
  const query = `PageSize=${pageSize}&Page=${page}`;

  return {
    [collectionName]: pageItems,
    page,
    page_size: pageSize,
    uri: `${baseUri}?${query}`,
    first_page_uri: `${baseUri}?PageSize=${pageSize}&Page=0`,
    previous_page_uri: page > 0 ? `${baseUri}?PageSize=${pageSize}&Page=${page - 1}` : null,
    next_page_uri: end < total ? `${baseUri}?PageSize=${pageSize}&Page=${page + 1}` : null,
    start,
    end: Math.max(0, end - 1),
    total
  };
}

function filterItems(items, filters) {
  if (!filters || Object.keys(filters).length === 0) return items;
  return items.filter((item) => Object.entries(filters).every(([key, value]) => {
    if (!value) return true;
    const normalizedKey = key.toLowerCase();
    const itemValue = String(item[key] || item[key.toLowerCase()] || '').toLowerCase();
    return itemValue.includes(String(value).toLowerCase());
  }));
}

function accountMismatch(res, accountSid, expectedAccountSid) {
  if (accountSid && accountSid !== expectedAccountSid) {
    res.status(404).json({ code: 20404, message: 'The requested resource /Accounts/' + accountSid + ' was not found', more_info: 'https://www.twilio.com/docs/errors/20404', status: 404 });
    return true;
  }
  return false;
}

function notFound(res, resourceType, id) {
  res.status(404).json({ code: 20404, message: `The requested resource /${resourceType}/${id} was not found`, more_info: 'https://www.twilio.com/docs/errors/20404', status: 404 });
}

module.exports = {
  paginate,
  filterItems,
  accountMismatch,
  notFound
};
