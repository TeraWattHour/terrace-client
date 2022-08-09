import { Topbar } from "../components/Topbar";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { borzoi } from "borzoi";
import { BottomBar } from "../components/BottomBar";
import { classes } from "../utils/classes";
import L from "leaflet";

function useQueryParams() {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const x = new Map<string, string>([]);
    params.forEach((v, k) => {
      x.set(k, v);
    });

    return x;
  }, [search]);
}

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

export const IndexPage = () => {
  const query = useQueryParams();

  const { data: list } = useQuery([`list/${query.get("listId")}`], () =>
    fetchList(query.get("listId"))
  );

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const {
    data: selectedPlace,
    isLoading: isSelectedPlaceLoading,
    refetch: refetchSelectedPlace,
  } = useQuery([`place/${list?.id}/${selectedPlaceId}`], () =>
    fetchPlace(selectedPlaceId, list?.id)
  );

  const [map, setMap] = useState<L.Map | null>(null);
  const [layerGroup, setLayerGroup] = useState<L.LayerGroup<any> | null>(null);

  let mapContainer: React.RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    setSelectedPlaceId(null);
    (async () => {
      await refetchSelectedPlace();
    })();
  }, [query.get("listId")]);

  useEffect(() => {
    if (!mapContainer.current) {
      return;
    }
    const container = mapContainer.current;
    if ((container as any)?._leaflet_id) {
      return;
    }

    var m = L.map(mapContainer.current).setView([51, -0.2], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    m.addEventListener("click", () => {
      setSelectedPlaceId(null);
    });

    const x = L.layerGroup().addTo(m);
    setMap(m);
    setLayerGroup(x);
  }, []);

  useEffect(() => {
    const m = map;
    const x = layerGroup;
    const l = list;
    if (!m || !x) {
      return;
    }
    x.clearLayers();
    if (!l?.places) {
      return;
    }
    m.setView([l.places[0].lat, l.places[0].lon], 7);

    for (const place of list.places) {
      L.marker([place.lat, place.lon], {
        title: place.name,
      })
        .addEventListener("click", () => {
          setSelectedPlaceId(place.id);
        })
        .addTo(x);
    }
  }, [map, layerGroup, list]);

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
            <div
              className="rounded-lg shadow-lg bg-center bg-no-repeat bg-cover relative cursor-pointer group"
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
                  "p-3 bg-white rounded-lg"
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
                    <header className="text-xl font-medium">{list.name}</header>
                    <span>{selectedPlace.description}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white p-3 rounded-lg overflow-hidden shadow-lg">
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
                  <header className="text-xl font-medium">{list.name}</header>
                  <p>{list.description}</p>
                  <div className="mt-2 text-stone-400 font-medium text-sm">
                    <i className="fas fa-user mr-2"></i>
                    {list.userId}
                  </div>
                </div>
                <div className="flex flex-row justify-end space-x-2 mt-3">
                  <a
                    className="rounded-lg bg-stone-200 py-2 px-4 hover:bg-stone-300 text-stone-500 hover:text-stone-800 transition-all"
                    href="https://www.youtube.com/watch?v=gW2LtX1217s&t=93s"
                  >
                    I like it!
                  </a>
                </div>
              </div>
            </div>
          </div>
        </BottomBar>
      )}

      <div ref={mapContainer} className="w-full h-full"></div>
    </div>
  );
};
