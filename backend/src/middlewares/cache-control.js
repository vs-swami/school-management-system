module.exports = () => {
  return async (ctx, next) => {
    if (ctx.url.startsWith('/api')) {
      ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      ctx.set('Pragma', 'no-cache');
      ctx.set('Expires', '0');
    }
    await next();
  };
};
