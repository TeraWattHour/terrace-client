import { Topbar } from "../components/Topbar";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

export const IndexPage = () => {
  return (
    <div className="h-full w-full">
      <Topbar />
      <MapContainer className="w-full h-full" center={[51.505, -0.09]} zoom={7}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};
