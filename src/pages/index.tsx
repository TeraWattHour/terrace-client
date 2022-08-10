import { Topbar } from "../components/Topbar";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { borzoi } from "borzoi";
import { Card } from "../components/Card";
import { BottomBar } from "../components/BottomBar";
import { classes } from "../utils/classes";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useQueryParams } from "../hooks/useQueryParams";
import { fetchList, fetchPlace } from "../api/list";
import { fetchUser } from "../api/user";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { ScreenLoader } from "../components/ScreenLoader";
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
    console.log("hrere");
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
              className="bg-center bg-no-repeat bg-cover"
              style={{
                backgroundImage: `url(${selectedPlace.banner})`,
              }}
            >
              <div
                className={classes(
                  selectedPlace.banner ? "bg-opacity-60" : "",
                  "bg-white rounded-lg"
                )}
              >
                <div className="flex flex-row space-x-4">
                  {selectedPlace.thumbnail && (
                    <img
                      src={selectedPlace.thumbnail}
                      className="w-32 rounded-lg h-32 flex-shrink-0"
                      alt=""
                    />
                  )}
                  <div className="flex-grow">
                    <header className="text-xl font-medium pb-1.5">
                      {selectedPlace.name}
                    </header>
                    <div className="pb-4">{selectedPlace.description}</div>
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
                      <span
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
                      </span>
                    </Tippy>
                  </div>
                </div>
              </div>
            </Card>
          )}
          <Card>
            <div className="flex flex-row space-x-4">
              {list.thumbnail && (
                <img
                  src={list.thumbnail}
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
                    {creator ? (
                      <>
                        <i className="fas fa-user mr-2"></i>
                        {creator?.name}
                      </>
                    ) : (
                      <i className="fal fa-wrench animate-spin text-lg"></i>
                    )}
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
    </div>
  );
};

type TParams = {
  listId?: string;
};
