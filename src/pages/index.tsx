import { Topbar } from "../components/Topbar";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { borzoi } from "borzoi";
import { Card } from "@/components/Card";
import { BottomBar } from "../components/BottomBar";
import { classes } from "../utils/classes";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useQueryParams } from "../hooks/useQueryParams";

const fetchList = async (listId?: string) => {
  if (!listId || !parseInt(listId)) throw new Error();

  const { data, ok } = await borzoi(`/list/${listId}`);

  if (!data?.data || !ok) throw new Error();

  return data.data;
};

const fetchPlace = async (placeId: number | null, listId?: number) => {
  if (!placeId || !listId) return null;

  const { data, ok } = await borzoi(`/place/${placeId}`);
  if (!data?.data || !ok) throw new Error();

  return data.data;
};

type TParams = {
  listId?: string;
};

export const IndexPage = () => {
  const query = useQueryParams<TParams>();

  const { data: list } = useQuery([`list/${query.listId}`], () =>
    fetchList(query.listId)
  );

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const {
    data: selectedPlace,
    isLoading: isSelectedPlaceLoading,
    refetch: refetchSelectedPlace,
  } = useQuery([`place/${list?.id}/${selectedPlaceId}`], () =>
    fetchPlace(selectedPlaceId, list?.id)
  );

  useEffect(() => {
    setSelectedPlaceId(null);
    (async () => {
      await refetchSelectedPlace();
    })();
  }, [query.listId]);

  return (
    <div className="h-full w-full">
      <Topbar />
      {list && (
        <BottomBar>
          {isSelectedPlaceLoading && (
            <div className="rounded-lg shadow-lg bg-white">
              <div className="flex items-center justify-center w-full py-10">
                <i className="fal fa-spinner-third animate-spin text-3xl"></i>
              </div>
            </div>
          )}
          {selectedPlace && selectedPlaceId && !isSelectedPlaceLoading && (
            <Card
              className="bg-center bg-no-repeat bg-cover relative cursor-pointer group"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${selectedPlace.lat}, ${selectedPlace.lon}`
                );
              }}
              style={{
                backgroundImage: `url(${selectedPlace.bannerUrl})`,
              }}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-all absolute -top-0.5 text-xs px-2 py-0.5 -translate-x-1/2 rounded-sm transform -translate-y-full left-1/2 bg-white font-semibold text-stone-600">
                Click me to copy location!
              </div>
              <div
                className={classes(
                  selectedPlace.bannerUrl ? "bg-opacity-60" : "",
                  "bg-white rounded-lg"
                )}
              >
                <div className="flex flex-row space-x-3">
                  {selectedPlace.thumbnailUrl && (
                    <img
                      src={selectedPlace.thumbnailUrl}
                      className="w-32 rounded-lg h-32 flex-shrink-0"
                      alt=""
                    />
                  )}
                  <div className="flex-grow">
                    <header className="text-xl font-medium pb-1.5">
                      {list.name}
                    </header>
                    <span>{selectedPlace.description}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
          <Card>
            <div className="flex flex-row space-x-3">
              {list.thumbnailUrl && (
                <img
                  src={list.thumbnailUrl}
                  className="w-32 rounded-lg h-32 flex-shrink-0"
                  alt=""
                />
              )}
              <div className="flex flex-col justify-between flex-grow">
                <div>
                  <header className="text-xl font-medium pb-1.5">
                    {list.name}
                  </header>
                  <p className="pb-2">{list.description}</p>
                  <div className="mt-2 text-stone-400 font-medium text-sm">
                    <i className="fas fa-user mr-2"></i>
                    {list.userId}
                  </div>
                </div>
                <div className="flex flex-row justify-end space-x-2 mt-3">
                  <a
                    className="rounded-lg bg-stone-200 py-3 px-4 hover:bg-stone-300 text-stone-500 hover:text-stone-800 transition-all"
                    href="https://www.youtube.com/watch?v=gW2LtX1217s&t=93s"
                  >
                    I like it!
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </BottomBar>
      )}

      <MapContainer
        className="w-full h-full"
        center={[list?.places[0].lat || 52, list?.places[0].lon || 0]}
        zoom={7}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {list?.places.map((place: TPlace) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lon }}
            eventHandlers={{
              click: () => {
                setSelectedPlaceId(place.id);
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};
