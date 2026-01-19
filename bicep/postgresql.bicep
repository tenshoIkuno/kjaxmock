targetScope = 'resourceGroup'

param serverName string 
param location string
param adminUsername string
@secure()
param adminPassword string
param sku string
param tier string

// APIバージョンが@2024-08-01だとうまくいかない
resource postgresql 'Microsoft.DBforPostgreSQL/flexibleServers@2021-06-01' = {
  name: serverName
  location: location
  sku: {
    name: sku
    tier: tier
  }
  properties: {
    administratorLogin: adminUsername
    administratorLoginPassword: adminPassword
    version: '17'
    storage: {
      storageSizeGB: 32
    }
    highAvailability: {
      mode: 'Disabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
  }
}
