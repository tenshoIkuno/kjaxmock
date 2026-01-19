param name string

param location string

@description('SKU (F0=無料/評価, S0=標準)')
@allowed([
  'F0'
  'S0'
])
param sku string = 'S0'

param publicNetworkAccess string = 'Enabled'

resource speech 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: name
  location: location
  kind: 'SpeechServices'
  sku: {
    name: sku
  }
  properties: {
    publicNetworkAccess: publicNetworkAccess
  }
}

output speechName string = speech.name
output speechEndpoint string = speech.properties.endpoint
