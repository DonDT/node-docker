FROM node:15
# each is a layer cached
WORKDIR /app
# each command is a layer cached
COPY package.json . 
# each command is a layer cached, install only 
# value passed when building docker compose file
ARG NODE_ENV 
RUN if [ "$NODE_ENV" = "development" ]; \
  then npm install; \
  else npm install --only=production; \
  fi

# copy all files in the current folder to app
# each time we change source code only layer 5 will be re-run, not the above.
COPY . ./ 

ENV PORT 3000

EXPOSE $PORT

CMD ["node", "index.js"]

