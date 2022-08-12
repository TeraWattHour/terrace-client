import { Topbar } from "../components/Topbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/Card";
import { BottomBar } from "../components/BottomBar";
import { classes } from "../utils/classes";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useQueryParams } from "../hooks/useQueryParams";
import { fetchList, fetchPlace } from "../api/list";
import { fetchUser } from "../api/user";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { useInterfaceStore } from "../store/InterfaceStore";

export const IndexPage = () => {
  const { setLoading } = useInterfaceStore();
  const query = useQueryParams<TParams>();

  const [isCopied, setIsCopied] = useState(false);
  const { data: list, isLoading: isListLoading } = useQuery<TList>(
    [`list/${query.listId}`],
    () => fetchList(query.listId)
  );
  const { data: creator } = useQuery<TUser>([`user/${list?.userId}`], () =>
    fetchUser(list?.userId)
  );

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const {
    data: selectedPlace,
    isLoading: isSelectedPlaceLoading,
    refetch: refetchSelectedPlace,
  } = useQuery<TPlace>([`place/${list?.id}/${selectedPlaceId}`], () =>
    fetchPlace(selectedPlaceId, list?.id)
  );

  useEffect(() => {
    setLoading("list", isListLoading);
  }, [isListLoading]);

  useEffect(() => {
    return () => {
      setLoading("list", false);
    };
  }, []);

  useEffect(() => {
    setSelectedPlaceId(null);
    (async () => {
      await refetchSelectedPlace();
    })();
  }, [query.listId]);

  return (
    <div className="h-full w-full">
      <Topbar />

      <MapContainer
        className="w-full h-full"
        center={[list?.places[0].lat || 52, list?.places[0].lon || -0.2]}
        zoom={7}
      >
        <Map list={list} setSelectedPlaceId={setSelectedPlaceId} />
      </MapContainer>
      {list && (
        <BottomBar>
          {isSelectedPlaceLoading && (
            <Card>
              <div className="flex items-center justify-center w-full py-7">
                <i className="fal fa-wrench animate-spin text-3xl"></i>
              </div>
            </Card>
          )}
          {!isSelectedPlaceLoading && selectedPlace && selectedPlaceId && (
            <Card
              className="bg-center bg-no-repeat bg-cover relative"
              style={{
                backgroundImage: `url(${selectedPlace.banner})`,
              }}
            >
              <button
                className="absolute top-3 right-4"
                onClick={() => setSelectedPlaceId(null)}
              >
                <i className="fal fa-close text-2xl "></i>
              </button>

              <div className="flex flex-row space-x-4">
                {selectedPlace.thumbnail && (
                  <img
                    src={selectedPlace.thumbnail}
                    className="w-32 rounded-lg h-32 flex-shrink-0 object-cover"
                    alt=""
                  />
                )}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <header className="text-xl font-medium">
                      {selectedPlace.name}
                    </header>
                    <p className="pb-4 !leading-normal">
                      {selectedPlace.description}
                    </p>
                  </div>
                  <Tippy
                    hideOnClick={false}
                    content={
                      <div>
                        {!isCopied
                          ? "Click me to copy!"
                          : "Copied to clipboard!"}
                      </div>
                    }
                  >
                    <div
                      onMouseLeave={() =>
                        setTimeout(() => {
                          setIsCopied(false);
                        }, 2000)
                      }
                      onClick={() => {
                        setIsCopied(true);
                        navigator.clipboard.writeText(
                          `${selectedPlace.lat}, ${selectedPlace.lon}`
                        );
                      }}
                      className="text-xs cursor-pointer"
                    >
                      <i className="fal fa-location-dot mr-2"></i>
                      {selectedPlace.lat}, {selectedPlace.lon}
                    </div>
                  </Tippy>
                </div>
              </div>
            </Card>
          )}
          <Card>
            <div className="flex flex-row space-x-4">
              {list.thumbnail && (
                <img
                  src={list.thumbnail}
                  className="w-32 rounded-lg h-32 flex-shrink-0 object-cover"
                  alt=""
                />
              )}
              <div className="flex flex-col justify-between flex-grow">
                <div>
                  <header className="text-xl font-medium">{list.name}</header>
                  <p className="pb-2 !leading-normal">{list.description}</p>
                  <div className="mt-2 text-sm"></div>
                </div>
                <div className="flex flex-row justify-end items-center space-x-4 mt-3">
                  {creator ? (
                    <Link
                      to={`/user/${creator.id}`}
                      className="text-stone-400 py-1 hover:text-stone-600 px-1.5"
                    >
                      <i className="fas fa-user mr-2"></i>
                      {creator?.name}
                    </Link>
                  ) : (
                    <i className="fal fa-wrench animate-spin text-lg"></i>
                  )}
                  {/* <button className="button-secondary">I like it!</button> */}
                </div>
              </div>
            </div>
          </Card>
        </BottomBar>
      )}
    </div>
  );
};

const Map = ({ list, setSelectedPlaceId }: TMapParams) => {
  const map = useMap();

  useEffect(() => {
    if (!list?.places || list.places.length === 0) {
      map.setView({ lat: 52, lng: -0.2 }, 7);
      return;
    }

    const place = list.places[0];
    map.setView({ lat: place.lat, lng: place.lon }, 7);
  }, [list?.places]);

  return (
    <>
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
    </>
  );
};

type TMapParams = {
  list?: TList;
  setSelectedPlaceId: (x: number) => void;
};

type TParams = {
  listId?: string;
};
