// --- 一括作成 ---

// targetScope='subscription'

// param resourceGroupName string = 'kj-ax' // リソースグループ名
// param resourceGroupLocation string = 'japaneast' // リソースグループリージョン

// // ### リソースグループ ###
// resource rg 'Microsoft.Resources/resourceGroups@2024-11-01' = {
//   name: resourceGroupName
//   location: resourceGroupLocation
// }

// // ### AOAIリソース ###
// // 定義ファイル：aoai.bicep
// module aoaiModule 'aoai.bicep' = {
//   name: 'aoaiModule'
//   scope: rg // 親（所属するグループ：kj-ax）         
//   params: {
//     name: 'kj-ax-ai' // リソース名
//     sku: 'S0' // プラン
//     location: resourceGroupLocation // リージョン
//   }
// }

// // ### Speech Service リソース ###
// // 定義ファイル：speech.bicep
// module speechModule 'speech.bicep' = {
//   name: 'speechModule'
//   scope: rg
//   params: {
//     name: 'kj-ax-as' // リソース名
//     location: resourceGroupLocation // リージョン
//     sku: 'S0' // プラン
//   }
// }

// // ### ACRリソース ###
// // 定義ファイル：acr.bicep
// module acrModule 'acr.bicep' = {
//   name: 'acrModule'
//   scope: rg
//   params: {
//     name: 'kjaxacr' // リソース名
//     location: resourceGroupLocation // リージョン
//     sku: 'Basic' // プラン
//     adminUserEnabled: true // adminユーザを有効にするか
//   }
// }

// // ### UAMI（ユーザー割り当てマネージドID）リソース ###
// // 定義ファイル：uami.bicep
// module uamiModule 'uami.bicep' = {
//   name: 'uamiModule'
//   scope: rg
//   params: {
//     name: 'kj-ax-uami' // リソース名
//     location: resourceGroupLocation // リージョン
//   }
// }

// // ### ACR Pull権限をUAMIに付与
// // 定義ファイル：role.bicep
// module roleAssignModule 'role.bicep' = {
//   name: 'roleAssignModule'
//   scope: rg
//   params: {
//     acrName: acrModule.outputs.acrName // 対象ACRリソースの名前
//     principalId: uamiModule.outputs.principalId // 権限を与える対象（UAMI）のID
//     resourceGroupName: resourceGroupName // リソースグループ名 kj-ax
//   }
// }

// // ### AppServiceリソース ###
// // 定義ファイル：appservice.bicep
// module appServiceModule 'appservice.bicep' = {
//   name: 'appServiceModule'
//   scope: rg
//   params: {
//     appServicePlanName: 'kj-ax-app-plan' // プランリソース名
//     name: 'kj-ax-app' // リソース名
//     location: resourceGroupLocation // リージョン
//     uamiId: uamiModule.outputs.uamiId // AppServiceに割り当てるUAMIのID
//   }
//   dependsOn: [
//     roleAssignModule
//   ]
// }

// DBリソース（検討中）
// 定義ファイル：postgresql.bicep
// module postgresqlModule 'postgresql.bicep' = {
//   name: 'postgresqlModule'
//   scope: resourceGroup()
//   params: {
//     serverName: 'kj-ax-db'
//     location: resourceGroupLocation
//     adminUsername: 'pgadmin'
//     adminPassword: 'Boken2025'
//     sku: 'Standard_B1ms'
//     tier: 'Burstable'
//   }
// }

// --- 個別作成 ---
// targetScope = 'resourceGroup'

// // ### AppServiceリソース ###
// // 定義ファイル：appservice.bicep
// param resourceGroupLocation string = resourceGroup().location
// module appServiceModule 'appservice.bicep' = {
//   name: 'appServiceModule'
//   scope: resourceGroup()
//   params: {
//     location: resourceGroupLocation // リージョン
//     appServicePlanName: 'kj-ax-app-plan' // プランリソース名
//     uamiId: '/subscriptions/e7da2424-2c81-4d1c-a3ec-bde08c9e15ed/resourcegroups/kj-ax/providers/Microsoft.ManagedIdentity/userAssignedIdentities/kj-ax-uami' // AppServiceに割り当てるUAMIのID
//     frontName: 'kj-ax-frontend' // リソース名
//     backName: 'kj-ax-backend' // リソース名
//     acrLoginServer: 'kjaxacr.azurecr.io' // ACRログインサーバ名
//     frontImage: 'frontend:latest' // ACRイメージ名
//     backImage: 'backend:latest' // ACRイメージ名
//   }
// }
