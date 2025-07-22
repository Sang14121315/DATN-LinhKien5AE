const generateSlug = (text) => {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

module.exports = { generateSlug };