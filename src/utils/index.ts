import config from '../config';

const utils = {
  getDbConnectionUrl: (): string => {
    const connectionUrl: string = config.mongoDbUrl;

    return connectionUrl
      .replace('<DB_USERNAME>', process.env.DB_USERNAME)
      .replace('<DB_PASSWORD>', process.env.DB_PASSWORD);
  },
};

export default utils;
