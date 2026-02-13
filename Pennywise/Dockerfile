FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Pennywise/Pennywise.csproj", "Pennywise/"]
COPY ["Pennywise.Domain/Pennywise.Domain.csproj", "Pennywise.Domain/"]
COPY ["Pennywise.Application/Pennywise.Application.csproj", "Pennywise.Application/"]
COPY ["Pennywise.Infrastructure/Pennywise.Infrastructure.csproj", "Pennywise.Infrastructure/"]
RUN dotnet restore "Pennywise/Pennywise.csproj"
COPY . .
WORKDIR "/src/Pennywise"
RUN dotnet build "./Pennywise.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Pennywise.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*
USER $APP_UID
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Pennywise.dll"]
