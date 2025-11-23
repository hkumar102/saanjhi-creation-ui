# 1) builder - install deps and build the workspace
FROM node:20-alpine AS builder
WORKDIR /app

ARG NG_BUILD_CONFIG=production
# copy package files and lockfile to leverage layer caching
COPY package*.json ./
# if using pnpm or yarn change accordingly

# copy entire repo (so library sources are available to the build)
COPY . .

# build command: adjust to your workspace script if different
# examples: npm run build -- --project=admin-portal  OR ng build admin-portal
RUN yarn install --frozen-lockfile && npx ng build admin-portal --configuration=${NG_BUILD_CONFIG}

# 2) production image - nginx serving built files
FROM nginx:stable-alpine AS runner
# copy built app from workspace dist - adjust dist path to your build output
# common Angular default: dist/projects/admin-portal or dist/admin-portal

# install curl in runtime image so healthcheck can run
RUN apk add --no-cache curl

ARG DIST_PATH=dist/admin-portal/browser
COPY --from=builder /app/${DIST_PATH} /usr/share/nginx/html

# remove default nginx config then copy a basic one (optional)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]