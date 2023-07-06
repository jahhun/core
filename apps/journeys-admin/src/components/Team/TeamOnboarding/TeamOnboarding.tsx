import { ReactElement } from 'react'
import Image from 'next/image'
import Box from '@mui/system/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { Form } from 'formik'
import { useRouter } from 'next/router'
import Divider from '@mui/material/Divider'
import taskbarIcon from '../../../../public/taskbar-icon.svg'
import { TeamCreateForm } from '../TeamCreateForm'
import { TeamMemberList } from '../TeamManageDialog/TeamMemberList'
import { useTeam } from '../TeamProvider'
import { UserTeamInviteForm } from '../TeamManageDialog/UserTeamInviteForm'
import { useUserTeamsAndInvitesQuery } from '../../../libs/useUserTeamsAndInvitesQuery'

export function TeamOnboarding(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const router = useRouter()
  const { activeTeam } = useTeam()
  async function handleSubmit(): Promise<void> {
    await router?.push('/')
  }
  const { data, emails } = useUserTeamsAndInvitesQuery(
    activeTeam != null
      ? {
          teamId: activeTeam.id
        }
      : undefined
  )
  return (
    <Stack
      justifyContent="space-evenly"
      alignItems="center"
      sx={{ height: '100vh', minHeight: 600 }}
    >
      <Stack alignItems="center" sx={{ maxWidth: { xs: 311, md: 397 } }}>
        <Box sx={{ mb: 10, flexShrink: 0 }}>
          <Image src={taskbarIcon} alt="Next Steps" height={43} width={43} />
        </Box>
        {activeTeam != null ? (
          <Card sx={{ width: '444px' }}>
            <CardHeader
              title={t(`Invite teammates to ${activeTeam.title}`)}
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ py: 5, px: 6 }}
            />
            <Divider />
            <CardContent sx={{ padding: 6 }}>
              <TeamMemberList />
            </CardContent>
            <Divider />
            <CardContent sx={{ px: 6, py: 4, width: '75%' }}>
              <UserTeamInviteForm users={emails} />
            </CardContent>
            <CardContent
              sx={{ padding: 2, display: 'flex', justifyContent: 'flex-end' }}
            >
              <Button onClick={async () => await handleSubmit()}>
                {(data?.userTeamInvites ?? []).length > 0
                  ? t('Continue')
                  : t('Skip')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TeamCreateForm>
            {({
              values,
              errors,
              handleChange,
              handleSubmit,
              isValid,
              isSubmitting
            }) => (
              <Form>
                <Card>
                  <CardHeader
                    title={t('Create Team')}
                    titleTypographyProps={{ variant: 'h6' }}
                    sx={{ py: 5, px: 6 }}
                  />
                  <CardContent sx={{ p: 6 }}>
                    <Stack spacing={4}>
                      <TextField
                        fullWidth
                        variant="filled"
                        hiddenLabel
                        id="title"
                        name="title"
                        value={values.title}
                        error={Boolean(errors.title)}
                        onChange={handleChange}
                        helperText={errors.title}
                        autoFocus
                      />
                      <Typography gutterBottom>
                        {t(
                          'Create a team to hold your NextStep journeys and collaborate with others.'
                        )}
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 4 }}>
                    {console.log(!isValid || isSubmitting)}
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={!isValid || isSubmitting}
                    >
                      {t('Create')}
                    </Button>
                  </CardActions>
                </Card>
              </Form>
            )}
          </TeamCreateForm>
        )}
      </Stack>
      <Link
        variant="body2"
        underline="none"
        sx={{
          color: 'primary.main',
          cursor: 'pointer'
        }}
        href="mailto:support@nextstep.is?subject=A question about the terms and conditions form"
      >
        {t('Feedback & Support')}
      </Link>
    </Stack>
  )
}
