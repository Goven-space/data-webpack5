import React, { useState, useEffect } from 'react';
import './index.less';
import { getPermissionInfo } from '@api/dataAccessApi/home';

const Footer = () => {
  const [footer, setFooter] = useState('');
  const [footUrl, setFootUrl] = useState('');

  useEffect(() => {
    getPermissionInfo().then(res => {
      const { footer, footUrl } = res.data;
      setFooter(footer || '');
      setFootUrl(footUrl || '');
    });
  }, []);

  let today = new Date();
  let CopyrightYear = today.getFullYear();

  return (
    <div className="footer-wrapper">
      <span>Copyright © {CopyrightYear}</span>
      <span>{footer}</span>
      <a href={footUrl} target='_blank' style={{color:'#999'}} >{footUrl}</a>
    </div>
  );
};

export default Footer;
