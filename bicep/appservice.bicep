targetScope = 'resourceGroup'

param appServicePlanName string
param location string
param uamiId string

param acrLoginServer string
param frontName string
param frontImage string
param backName string
param backImage string

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'F1' 
    tier: 'Free'
  }
  kind: 'linux' // LinuxベースのAppServiceプランであることを指定
  properties: {
    reserved: true // リソースが Linux 用に予約されていることを明示
  }
}

// フロント WebApp
resource frontWebApp 'Microsoft.Web/sites@2023-12-01' = {
  name: frontName
  location: location
  kind: 'app,linux,container' // 実行環境指定
  identity: { // AppServiceにUAMIを付与
    type: 'UserAssigned' 
    userAssignedIdentities: {
      '${uamiId}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id // プランとの紐づけ  
    httpsOnly: true
    siteConfig: { // AppServiceがコンテナイメージをpullする時に、UAMIを使う指定
      linuxFxVersion: 'DOCKER|${acrLoginServer}/${frontImage}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: uamiId
      // 環境変数（パスワード系は空欄）
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '80'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${acrLoginServer}'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: 'kjaxacr'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: ''
        }
      ]
    }
  }
}

// バックWebApp
resource backWebApp 'Microsoft.Web/sites@2023-12-01' = {
  name: backName
  location: location
  kind: 'app,linux,container' // 実行環境指定
  identity: { // AppServiceにUAMIを付与
    type: 'UserAssigned' 
    userAssignedIdentities: {
      '${uamiId}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id // プランとの紐づけ  
    httpsOnly: true
    siteConfig: { // AppServiceがコンテナイメージをpullする時に、UAMIを使う指定
       linuxFxVersion: 'DOCKER|${acrLoginServer}/${backImage}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: uamiId
      // 環境変数（パスワード系は空欄）
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '8000'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${acrLoginServer}'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: 'kjaxacr'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: ''
        }
        // --- 以下、アプリ環境変数 ---
        // --- DB ---
        {
          name: 'POSTGRES_USER_SCHEMA'
          value: 'schema_admin'
        }
        {
          name: 'POSTGRES_PASSWORD_SCHEMA'
          value: ''
        }
        {
          name: 'POSTGRES_USER_APP'
          value: 'app_user'
        }
        {
          name: 'POSTGRES_PASSWORD_APP'
          value: ''
        }
        {
          name: 'POSTGRES_HOST'
          value: 'kj-ax-db.postgres.database.azure.com'
        }
        {
          name: 'POSTGRES_PORT'
          value: '5432'
        }
        {
          name: 'POSTGRES_DB'
          value: 'app_db'
        }

        // --- Azure OpenAI ---
        {
          name: 'AZURE_OPENAI_ENDPOINT'
          value: 'https://kj-ax-ai.openai.azure.com/'
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: ''
        }
        {
          name: 'AZURE_OPENAI_DEPLOYMENT'
          value: 'gpt-4o-mini'
        }
        {
          name: 'AZURE_OPENAI_API_VERSION'
          value: '2024-12-01-preview'
        }

        // --- Speech Service ---
        {
          name: 'AZURE_SPEECH_REGION'
          value: 'japaneast'
        }
        {
          name: 'AZURE_SPEECH_KEY'
          value: ''
        }

        // --- Entra ID ---
        {
          name: 'ENTRA_BASE'
          value: 'https://sorikjax.ciamlogin.com/b0323ed7-9e97-4e37-90ea-36f1051f2088'
        }
        {
          name: 'POLICY'
          value: 'UserFlow'
        }
        {
          name: 'FRONTEND_URL'
          value: 'https://kj-ax-frontend.azurewebsites.net'
        }
        {
          name: 'CLIENT_ID'
          value: '9ddcbcf8-fe46-435b-8ffd-dad1a4ed6996'
        }
        {
          name: 'CLIENT_SECRET'
          value: ''
        }
        {
          name: 'REDIRECT_URI'
          value: 'https://kj-ax-frontend.azurewebsites.net/api/auth/callback'
        }
        {
          name: 'SCOPES'
          value: 'openid profile email offline_access'
        }
        {
          name: 'REFRESH_THRESHOLD'
          value: '300'
        }
        {
          name: 'USE_DUMMY_USER'
          value: 'false'
        }
      ]
    }
  }
}
