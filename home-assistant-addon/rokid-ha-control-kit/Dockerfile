ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.19
FROM golang:1.26 AS build
WORKDIR /src
COPY rokid-ha-control-kit/go.mod ./
COPY rokid-ha-control-kit/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/rokid-ha-control-kit .

FROM ${BUILD_FROM}
COPY --from=build /out/rokid-ha-control-kit /usr/bin/rokid-ha-control-kit
COPY home-assistant-addon/rokid-ha-control-kit/rootfs /
RUN chmod a+x /usr/bin/rokid-ha-control-kit /etc/services.d/rokid-ha-control-kit/run
