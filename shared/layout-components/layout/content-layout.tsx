import React, { Fragment, useEffect, useState } from 'react'
import Sidebar from '../sidebar/sidebar';
import { Provider } from 'react-redux';
import store from '@/shared/redux/store';
import Header from '../header/header';
import Footer from '../footer/footer';
import Switcher from '../switcher/switcher';
import Backtotop from '../backtotop/backtotop'
import PrelineScript from '@/pages/PrelineScript';
import { Initialload } from '../contextapi';

const ContentLayout = ({ children }:any) => {

  const [lateLoad, setlateLoad] = useState(false);
	const Add = () => {
	  document.querySelector("body")?.classList.remove("error-1");
	  document.querySelector("body")?.classList.remove("landing-body");
	};
	
	useEffect(() => {
	  Add();
	  setlateLoad(true);
	});

  const [MyclassName, setMyClass] = useState("");
  const Bodyclickk = () => {
    const theme = store.getState();
    if (localStorage.getItem("ynexverticalstyles") == "icontext") {
      setMyClass("");
    }
    if (window.innerWidth > 992) {
      const html = document.documentElement;
      if (html.getAttribute('icon-overlay') === 'open') {
          html.setAttribute('icon-overlay' ,"");
      }
    }
  }
  const [pageloading, setpageloading] = useState(false)

  return (
    <>
    <Fragment>
      <Initialload.Provider value={{ pageloading, setpageloading }}>
       <Provider store={store}>
       <div style={{display: `${lateLoad ? 'block' : 'none'}`}}>
        <Switcher/>
      <div className='page'>
        <Header/>
        <Sidebar/>
        <div className='content'>
          <div className='main-content'  onClick={Bodyclickk}>
            {children}
          </div>
        </div>
        <Footer/>
      </div>
      <Backtotop />
      <PrelineScript/>
        </div>
      </Provider>
      </Initialload.Provider>
    </Fragment>
    </>

  )
}

export default ContentLayout;