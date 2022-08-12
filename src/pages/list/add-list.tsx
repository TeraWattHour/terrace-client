import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { withAuth } from "../../components/withAuth";
import { z } from "zod";
import { borzoi } from "borzoi";
import { useNavigate } from "react-router-dom";
import { useInterfaceStore } from "../../store/InterfaceStore";
import { create_list_dto } from "common/dtos/list";
import { ErrorCode } from "common/errorCodes";

const Page = () => {
  const { isLoading, setLoading } = useInterfaceStore();
  const [list, setList] = useState({
    name: "",
    description: "",
    thumbnail: "",
  });
  const [places, setPlaces] = useState<TPlace[]>([]);
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setErrors([]);

    const validation = await create_list_dto.safeParseAsync({
      ...list,
      places,
    });
    if (!validation.success) {
      return setErrors(validation.error.issues);
    }

    setLoading("adding-list", true);
    const { data, ok } = await borzoi(`/list`, {
      method: "post",
      credentials: "include",
      body: validation.data,
    });
    setLoading("adding-list", false);
    if (ok && data?.data?.id) {
      navigate(`/?listId=${data.data.id}`);
    }
    if (data?.errors) {
      const serverErrs = data.errors;
      const isZodErrors = serverErrs[0].code === ErrorCode.VALIDATION;
      if (isZodErrors) {
        setErrors(serverErrs[0].data);
      }
    }
  };

  const onPlaceChange =
    (i: number) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPlaces((x) =>
        x.map((y, j) =>
          j === i ? { ...y, [e.target.name]: e.target.value } : y
        )
      );
    };

  return (
    <div className="bg-stone-100 min-h-full">
      <div className="w-full h-full  mt-0 pt-4">
        <div className="max-w-[600px] py-3 mx-auto px-4">
          <header className="text-2xl font-medium mb-3">Terrace</header>
          <div className="shadow-md border rounded-xl bg-white px-4 py-3">
            <div className="font-medium text-lg mb-2">Add a list</div>
            <div className="flex flex-col space-y-2">
              <input
                value={list.name}
                onChange={(e) =>
                  setList((x) => ({ ...x, name: e.target.value }))
                }
                type="text"
                placeholder="Name"
                className="py-2 px-3 rounded-md border w-full bg-stone-100 focus:ring-2 outline-none focus:ring-stone-300 focus:bg-white transition-all"
              />
              <textarea
                value={list.description}
                onChange={(e) =>
                  setList((x) => ({ ...x, description: e.target.value }))
                }
                placeholder="Description"
                className="py-2 px-3 rounded-md border w-full bg-stone-100 focus:ring-2 outline-none focus:ring-stone-300 focus:bg-white transition-all"
              />
              <input
                value={list.thumbnail}
                onChange={(e) =>
                  setList((x) => ({
                    ...x,
                    thumbnail: e.target.value,
                  }))
                }
                type="url"
                placeholder="Thumbnail URL"
                className="py-2 px-3 rounded-md border w-full bg-stone-100 focus:ring-2 outline-none focus:ring-stone-300 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
        <div className="my-5">
          <div className="text-center text-stone-500 test-sm py-2">
            Click a map to add a place!
          </div>
          <MapContainer className="w-full h-[700px]" center={[52, 0]} zoom={7}>
            <TileLayer
              eventHandlers={{
                click: () => {
                  console.log("lcick");
                },
              }}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Map places={places} setPlaces={setPlaces} />
          </MapContainer>
        </div>
        <div className="flex flex-col space-y-2 max-w-[600px] py-3 mx-auto px-4">
          {places.map((place, i) => (
            <div
              key={i}
              className="shadow-md border rounded-xl px-4 py-3 bg-white"
            >
              <div className="font-medium text-lg mb-2">Name a place</div>
              <div className="flex flex-col space-y-2">
                <input
                  name="name"
                  type="text"
                  value={places[i].name || ""}
                  onChange={onPlaceChange(i)}
                  placeholder="Name"
                  className="py-2 px-3 rounded-md border w-full bg-stone-100 focus:ring-2 outline-none focus:ring-stone-300 focus:bg-white transition-all"
                />
                <input
                  name="thumbnail"
                  value={places[i].thumbnail || ""}
                  onChange={onPlaceChange(i)}
                  type="url"
                  placeholder="Thumbnail URL"
                  className="py-2 px-3 rounded-md border w-full bg-stone-100 focus:ring-2 outline-none focus:ring-stone-300 focus:bg-white transition-all"
                />
                <input
                  value={places[i].banner || ""}
                  onChange={onPlaceChange(i)}
                  name="banner"
                  type="url"
                  placeholder="Banner URL"
                  className="py-2 px-3 rounded-md border w-full bg-stone-100 focus:ring-2 outline-none focus:ring-stone-300 focus:bg-white transition-all"
                />
                <textarea
                  name="description"
                  value={places[i].description || ""}
                  onChange={onPlaceChange(i)}
                  placeholder="Description"
                  className="py-2 px-3 rounded-md border w-full bg-stone-100 focus:ring-2 outline-none focus:ring-stone-300 focus:bg-white transition-all"
                />
                <div className="flex flex-row justify-end mt-2">
                  <button
                    onClick={() =>
                      setPlaces((x) => x.filter((_, j) => i !== j))
                    }
                    className="w-max bg-stone-100 px-4 py-2 text-stone-600 text-center transition-all hover:bg-stone-200 hover:text-stone-800 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <Errors errors={errors} />
          {places.length > 0 && (
            <div className="shadow-md border rounded-xl bg-white flex flex-row justify-end py-3 px-4">
              <button
                onClick={handleSubmit}
                className="w-max bg-stone-100 px-4 py-2 text-stone-600 text-center transition-all hover:bg-stone-200 hover:text-stone-800 rounded-lg"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Errors = ({ errors }: { errors?: z.ZodIssue[] | null }) => {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="shadow-md border rounded-xl px-4 py-3 bg-red-100">
      <header className="text-lg font-medium">Form contains some errors</header>
      <ul>
        {errors.map((issue, x) => (
          <li key={x}>
            <span className="font-medium capitalize">
              {issue.path.join("=>")}:{" "}
            </span>
            <span>{issue.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Map = ({ places, setPlaces }: TMapProps) => {
  const map = useMapEvents({
    click(e) {
      setPlaces((x: TPlace[]) => [
        ...x,
        {
          name: "",
          lat: e.latlng.lat,
          lon: e.latlng.lng,
          description: "",
        },
      ]);
    },
  });

  return (
    <>
      {places.map((place, i) => (
        <Marker
          position={{ lat: place.lat, lng: place.lon }}
          key={i}
          title={place.name}
          eventHandlers={{
            click: () => {
              setPlaces((x: TPlace[]) => x.filter((_: any, j: any) => i !== j));
            },
          }}
        />
      ))}
    </>
  );
};

type TMapProps = {
  places: TPlace[];
  setPlaces: Function;
};

export const AddListPage = withAuth(Page);
