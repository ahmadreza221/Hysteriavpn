import { useState } from 'react';
import { QRCodeSVG as QRCode } from "qrcode.react";

function HysteriaAdminPanel() {
  const [yaml, setYaml] = useState('');
  const [domain, setDomain] = useState('');
  const [port, setPort] = useState('');
  const [password, setPassword] = useState('');

  const generate = () => {
    const content = `server: ${domain}:${port}\nipv6: true\npassword: ${password}`;
    setYaml(content);
  };

  const download = () => {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <div className="space-y-2">
        <input className="border p-1" placeholder="Domain" value={domain} onChange={e=>setDomain(e.target.value)}/>
        <input className="border p-1" placeholder="Port" value={port} onChange={e=>setPort(e.target.value)}/>
        <input className="border p-1" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className="bg-blue-500 text-white px-2 py-1" onClick={generate}>Generate</button>
      </div>
      {yaml && (
        <div className="mt-4">
          <pre className="bg-gray-100 p-2">{yaml}</pre>
          <QRCode value={yaml} />
          <button className="bg-green-500 text-white px-2 py-1" onClick={download}>Download YAML</button>
        </div>
      )}
    </div>
  );
}

export default HysteriaAdminPanel;
