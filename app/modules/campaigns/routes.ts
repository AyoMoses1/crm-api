import router from '@adonisjs/core/services/router'
const CampaignController = () => import('#controllers/campaigns_controller')

router
  .group(() => {
    router.post('/campaigns', [CampaignController, 'createCampaign'])
    router.get('/campaigns', [CampaignController, 'getAllCampaigns'])
    router.get('/campaigns/:id', [CampaignController, 'getCampaignDetails'])
    router.put('/campaign/:id', [CampaignController, 'updateCampaign'])
  })
  .prefix('/api/v1')
