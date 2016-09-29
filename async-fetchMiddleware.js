export default function clientMiddleware(createClient) {
  return ({ dispatch, getState }) => {

    const client = createClient(getState);

    return next => action => {
      const { promise, types, ...rest } = action;
      if (!promise) {
        return next(action);
      }

      rest._payload = rest.payload;

      const [REQUEST, SUCCESS, FAILURE, ALWAYS] = types;
      next({ ...rest, type: REQUEST });
      return promise(client, getState).then(
        (result) => {
          const succ = dispatch({ ...rest, payload: result, type: SUCCESS });
          if (ALWAYS) {
            dispatch({ ...rest, payload: result, type: ALWAYS });
          };
          return succ;
        },
        (error) => {
          dispatch({ ...rest, error, type: FAILURE });
          if (ALWAYS) {
            dispatch({ ...rest, error, type: ALWAYS });
          }
          return Promise.reject(error);
        }
      );
    };
  };
}
