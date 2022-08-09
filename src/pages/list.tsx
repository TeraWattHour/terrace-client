import { API } from "../consts/api";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { createResource, createSignal } from "solid-js";
import { Topbar } from "../components/Topbar";
import L from "leaflet";
import { createEffect } from "solid-js";
import { RefType } from "@/utils/types";
import { BottomBar } from "../components/BottomBar";
import { classes } from "../utils/classes";
const fetchList = async (listId: string) => {
  console.log("fetching list");
  if (!listId) return null;

  const response = await fetch(`${API}/list/${listId}`);
  const data = await response.json();

  return data.data;
};

const fetchPlace = async (placeId: number | null) => {
  if (!placeId) return null;

  const response = await fetch(`${API}/place/${placeId}`);
  const data = await response.json();

  return data.data;
};

export const ListPage = () => {
  const params = useParams();

  const [list, { refetch: refetchList }] = createResource(
    params?.listId,
    fetchList
  );
  const [map, setMap] = createSignal<L.Map | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = createSignal<number | null>(
    null
  );
  const [selectedPlace] = createResource(selectedPlaceId, fetchPlace);
  const [layerGroup, setLayerGroup] = createSignal<L.LayerGroup<any> | null>(
    null
  );

  createEffect(() => {
    refetchList();
    console.log("here");
  }, params?.listId);

  let mapContainer: RefType<HTMLDivElement>;

  createEffect(() => {
    if (!(mapContainer instanceof HTMLDivElement)) {
      return;
    }

    var m = L.map(mapContainer);
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

  createEffect(() => {
    const m = map();
    const x = layerGroup();
    const l = list();
    if (!m || !x) {
      return;
    }
    x.clearLayers();
    if (!l?.places) {
      return;
    }
    m.setView([l.places[0].lat, l.places[0].lon], 7);

    for (const place of list().places) {
      L.marker([place.lat, place.lon], {
        title: place.name,
      })
        .addEventListener("click", () => {
          setSelectedPlaceId(place.id);
        })
        .addTo(x);
    }
  }, [map(), layerGroup(), list()]);

  return (
    <div class="h-full w-full">
      <Topbar />

      {list() && (
        <BottomBar>
          {selectedPlace() && selectedPlaceId() && (
            <div
              class="rounded-lg shadow-lg bg-center bg-no-repeat bg-cover relative cursor-pointer group"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${selectedPlace().lat}, ${selectedPlace().lon}`
                );
              }}
              style={{
                "background-image": `url(${selectedPlace().bannerUrl})`,
              }}
            >
              <div class="opacity-0 group-hover:opacity-100 transition-all absolute -top-0.5 text-xs px-2 py-0.5 -translate-x-1/2 rounded-sm transform -translate-y-full left-1/2 bg-white font-semibold text-stone-600">
                Click me to copy location!
              </div>
              <div
                class={classes(
                  selectedPlace().bannerUrl ? "bg-opacity-60" : "",
                  "p-3 bg-white rounded-lg backdrop-blur-sm"
                )}
              >
                <div class="flex flex-row space-x-3">
                  {selectedPlace().thumbnailUrl && (
                    <img
                      src={selectedPlace().thumbnailUrl}
                      class="w-32 rounded-lg h-32 flex-shrink-0"
                      alt=""
                    />
                  )}
                  <div class="flex-grow">
                    <header class="text-xl font-medium">{list().name}</header>
                    <span>{selectedPlace().description}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div class="bg-white p-3 rounded-lg overflow-hidden shadow-lg">
            <div class="flex flex-row space-x-3">
              {list().thumbnailUrl && (
                <img
                  src={list().thumbnailUrl}
                  class="w-32 rounded-lg h-32 flex-shrink-0"
                  alt=""
                />
              )}
              <div class="flex flex-col justify-between flex-grow">
                <div class="">
                  <header class="text-xl font-medium">{list().name}</header>
                  <p>{list().description}</p>
                  <div class="mt-2 text-stone-400 font-medium text-sm">
                    <i class="fas fa-user mr-2"></i>
                    {list().userId}
                  </div>
                </div>
                <div class="flex flex-row justify-end space-x-2">
                  <button class="rounded-lg bg-stone-200 py-2 px-4 hover:bg-stone-300 text-stone-500 hover:text-stone-800 transition-all">
                    <i class="fal fa-fork mr-2"></i>
                    Fork
                  </button>
                  <a
                    class="rounded-lg bg-stone-200 py-2 px-4 hover:bg-stone-300 text-stone-500 hover:text-stone-800 transition-all"
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
      {/* <div class="fixed bottom-0"></div> */}
      <div ref={mapContainer} class="w-full h-full"></div>
    </div>
  );
};
