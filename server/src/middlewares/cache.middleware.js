import {redisClient} from '../utils/redisClient.js'

export const cacheMiddleware = async (req, res, next) => {
    const searchable = req.query.searchable
    const cacheKey = `search:${searchable}`;
  
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log('Yeah, Picked from cachedData.');
        return res.json(JSON.parse(cachedData));
      }
      next();
    } catch (err) {
      next(err);
    }
};