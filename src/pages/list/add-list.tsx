import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { withAuth } from "../../components/withAuth";
import { z } from "zod";
import { borzoi } from "borzoi";
import { useNavigate } from "react-router-dom";
import { useInterfaceStore } from "../../store/InterfaceStore";
import { create_list_dto } from "common/dtos/list";
import { ErrorCode } from "common/errorCodes";
import { Backdrop } from "../../components/Backdrop/Backdrop";
import { edit_place_dto } from "common/dtos/place";
import { Card } from "../../components/Card";
import { AnimatePresence, motion } from "framer-motion";

const Page = () => {
  const { setLoading } = useInterfaceStore();
  const [list, setList] = useState({
    name: "",
    description: "",
    thumbnail: "",
  });
  const [places, setPlaces] = useState<Partial<TPlace>[]>([]);
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [temporaryErrors, setTemporaryErrors] = useState<z.ZodIssue[]>([]);
  const [temporaryPlace, setTemporaryPlace] = useState<Partial<TPlace> | null>(
    null
  );
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

  useEffect(() => {
    setTemporaryErrors([]);
  }, [temporaryPlace]);

  const editPlace = (place: Partial<TPlace>) => {
    setTemporaryPlace(place);
  };

  const addPlace = async () => {
    setTemporaryErrors([]);
    if (!temporaryPlace) return;

    const validation = await edit_place_dto.safeParseAsync(temporaryPlace);
    if (!validation.success) {
      return setTemporaryErrors(validation.error.issues);
    }

    setPlaces((x) => [...x, temporaryPlace]);
    setTemporaryPlace(null);
  };

  const onTemporaryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTemporaryPlace((x) => ({ ...x, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-stone-100 min-h-full">
      <div className="w-full h-full  mt-0 pt-4">
        <div className="max-w-[600px] py-3 mx-auto px-4">
          <header className="text-2xl font-medium mb-5">Terrace</header>
          <div className="shadow-md border rounded-xl bg-white px-4 py-3">
            <div className="font-medium text-lg mb-2">Create a list</div>
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
            Click a map to add a place!{" "}
          </div>
          <div className="relative overflow-hidden">
            <AnimatePresence>
              {temporaryPlace && (
                <div className="!z-[999999] absolute top-0 left-0 p-4 w-full pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, x: "400px" }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: "400px" }}
                    transition={{ ease: "easeInOut", duration: 0.5 }}
                    className=" mx-auto w-full max-w-[1800px] flex flex-row justify-end"
                  >
                    <Card className="w-full max-w-[550px] pointer-events-auto">
                      <h2 className="text-xl font-medium mb-5">
                        Add a place to your list
                      </h2>
                      <div className="flex flex-col space-y-3">
                        {temporaryErrors && temporaryErrors.length > 0 && (
                          <div className="shadow-md rounded-lg px-4 py-3 bg-red-100 border-[3px] border-red-500">
                            <header className="text-lg font-medium text-red-800">
                              Your form contains some errors
                            </header>
                            <ul className="text-red-700">
                              {temporaryErrors.map((issue, x) => (
                                <li key={x}>
                                  <span className="capitalize">
                                    {issue.path.join("-")}:{" "}
                                  </span>
                                  <span>{issue.message}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <input
                          name="name"
                          value={temporaryPlace.name || ""}
                          onChange={onTemporaryChange}
                          type="text"
                          placeholder="Name"
                          className="input-primary"
                        />
                        <input
                          name="thumbnail"
                          value={temporaryPlace.thumbnail || ""}
                          onChange={onTemporaryChange}
                          placeholder="Thumbnail URL"
                          className="input-primary"
                        />

                        <textarea
                          value={temporaryPlace.description || ""}
                          onChange={onTemporaryChange}
                          name="description"
                          placeholder="Description"
                          className="input-primary"
                        />
                        <div className="flex flex-row justify-end space-x-3 mt-2">
                          <button
                            onClick={() => setTemporaryPlace(null)}
                            className="button-secondary"
                          >
                            Discard
                          </button>
                          <button
                            onClick={addPlace}
                            className="button-primary min-w-[150px] !justify-center"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            <MapContainer
              className="w-full h-[500px] md:h-[700px]"
              center={[52, 0]}
              zoom={7}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Map
                places={places}
                createPlace={editPlace}
                setPlaces={setPlaces}
                temporaryPlace={temporaryPlace}
                setTemporaryPlace={setTemporaryPlace}
              />
            </MapContainer>
          </div>
        </div>
        <div className="flex flex-col space-y-2 max-w-[600px] py-3 mx-auto px-4 pb-20">
          <Errors errors={errors} />
          {places.map((place, i) => (
            <div
              key={i}
              className="shadow-md flex flex-row border rounded-xl space-x-3 px-4 py-3 bg-white"
            >
              {place.thumbnail && (
                <img
                  className="h-32 w-32 rounded-lg object-cover"
                  src={place.thumbnail}
                  alt=""
                />
              )}
              <div className="flex-grow">
                <header className="text-lg font-medium">{place.name}</header>
                <div className="mb-2">{place.description}</div>
                <span className="text-sm text-stone-600">
                  <i className="far fa-location dot mr-0.5"></i> {place.lat},{" "}
                  {place.lon}
                </span>

                <div className="flex flex-row justify-end mt-2">
                  <button
                    onClick={() => {
                      setTemporaryPlace(place);
                      setPlaces((x) => x.filter((_, j) => i !== j));
                    }}
                    className="button-secondary"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {places.length >= 2 && (
            <button
              onClick={handleSubmit}
              className="button-primary justify-center "
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Errors = ({ errors }: { errors?: z.ZodIssue[] | null }) => {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="shadow-md rounded-xl px-4 py-3 bg-red-100 border-[3px] border-red-500">
      <header className="text-lg font-medium text-red-800">
        Your form contains some errors
      </header>
      <ul className="text-red-700">
        {errors.map((issue, x) => (
          <li key={x}>
            <span className="font-medium">{issue.path.join("=>")}: </span>
            <span>{issue.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Map = ({
  places,
  createPlace,
  setPlaces,
  temporaryPlace,
  setTemporaryPlace,
}: TMapProps) => {
  const map = useMapEvents({
    click(e) {
      createPlace({
        name: temporaryPlace?.name || "",
        description: temporaryPlace?.description || "",
        thumbnail: temporaryPlace?.thumbnail || "",
        lat: e.latlng.lat,
        lon: e.latlng.lng,
      });
    },
  });

  return (
    <>
      {places.map((place, i) => (
        <Marker
          position={{ lat: place.lat!, lng: place.lon! }}
          key={i}
          opacity={(temporaryPlace ? "50%" : "100%") as unknown as number}
          title={place.name}
          eventHandlers={{
            click: () => {
              if (temporaryPlace) return;
              console.log("hrer");
              setTemporaryPlace(place);
              setPlaces((x: TPlace[]) => x.filter((_: any, j: any) => i !== j));
            },
          }}
        />
      ))}
      {temporaryPlace && (
        <Marker
          position={{ lat: temporaryPlace.lat!, lng: temporaryPlace.lon! }}
        />
      )}
    </>
  );
};

type TMapProps = {
  places: Partial<TPlace>[];
  createPlace: Function;
  setPlaces: Function;
  temporaryPlace: Partial<TPlace> | null;
  setTemporaryPlace: Function;
};

export const AddListPage = withAuth(Page);
