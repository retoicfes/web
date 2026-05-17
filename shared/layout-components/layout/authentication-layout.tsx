import store from '@/shared/redux/store'
import React, { Fragment } from 'react'
import { Provider } from 'react-redux'
import Switcher from '../switcher/switcher'
import PrelineScript from '@/pages/PrelineScript'

const Authenticationlayout = ({children}:any) => {
  return (
    <Fragment>
      <Provider store={store}>
             <Switcher/>
             {children}
              <PrelineScript/>
        </Provider>
    </Fragment>
  )
}

export default Authenticationlayout;