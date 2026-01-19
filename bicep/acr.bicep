targetScope = 'resourceGroup'

param name string
param location string
param sku string
param adminUserEnabled bool

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: name
  location: location
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: adminUserEnabled
  }
}

output acrName string = acr.name
