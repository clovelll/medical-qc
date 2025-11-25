"use client";
import { useEffect, useState } from "react";

const ClientComponent = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClient(true);
  }, []);
  return <>{client ? children : null}</>;
};

export default ClientComponent;
