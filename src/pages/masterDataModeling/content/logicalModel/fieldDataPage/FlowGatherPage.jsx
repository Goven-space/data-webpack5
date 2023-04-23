import React, {useState, useEffect} from 'react';

 

function FlowGatherPage(props) {
    const { flowIds, isModal, applicationId } = props;

    const [iframeHeight, setIframeHeight] = useState(100);
    const origin = window.location.origin

    useEffect(() => {
      window.onresize = function () {
        initIframeHeight();
      };
      initIframeHeight();
      return () => {
        window.onresize = null;
      };
    }, []);

    const initIframeHeight = () => {
      const bodyHeight = document.body.scrollHeight;
      const height = bodyHeight - (isModal ? 140 : 230);
      setIframeHeight(height);
    };

    return <iframe style={{ width: '100%', height: iframeHeight, borderWidth: 0 }} src={`${origin}/restcloud/admin/etl/processDesigner?wrapper=assets&flowIds=${flowIds}&appId=etl&applicationId=${applicationId}`} />;
   
}

export default FlowGatherPage;