import '../styles/app.css';
import ContentLayout from '../shared/layout-components/layout/content-layout';
import Authenticationlayout from "../shared/layout-components/layout/authentication-layout";

const layouts:any = {

  Contentlayout: ContentLayout,
  Authenticationlayout: Authenticationlayout,

};
function MyApp({ Component, pageProps }:any) {
  
  const Layout = layouts[Component.layout] || ((pageProps: any) => <Component>{pageProps}</Component>);

  return (

    <Layout>
      <Component {...pageProps} />
    </Layout>
    
  )
}

export default MyApp;