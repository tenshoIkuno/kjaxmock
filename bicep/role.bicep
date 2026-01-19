targetScope = 'resourceGroup'

param acrName string
param principalId string
param resourceGroupName string

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: acrName
}

resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroupName, acrName, 'kj-ax-uami', 'AcrPull') // ロール割り当てリソースの一意なIDを生成
  scope: acr
  properties: {
    // ロールのID
    // 7f951...はAzure公式で定義されているロールの固定ID
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}
