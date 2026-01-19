targetScope = 'resourceGroup'

param name string 
param location string
param sku string

resource aoai 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: name
  location: location
  kind: 'OpenAI'
  sku: {
    name: sku
  }
  properties: {
    customSubDomainName: name
  }
} 
