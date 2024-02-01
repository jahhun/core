import { AuthAction, withUser } from 'next-firebase-auth'
import { FC } from 'react'

import { AuthLayout } from '../src/components/AuthLayout'
import { Loader } from '../src/components/Loader'
import { Login } from '../src/components/Login/Login'

const LoginPage: FC = () => {
  return (
    <AuthLayout>
      <Login />
    </AuthLayout>
  )
}

export default withUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  LoaderComponent: Loader
})(LoginPage)
