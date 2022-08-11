import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { borzoi } from "borzoi";
import { format } from "date-fns";
import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { GoBack } from "../components/GoBack";
import { useQueryParams } from "../hooks/useQueryParams";
import { useInterfaceStore } from "../store/InterfaceStore";

const fetchUser = async (userId?: string) => {
  if (!userId) return null;

  const { data, ok } = await borzoi(`/user/${userId}`, {
    credentials: "include",
  });
  if (ok && data.data) {
    return data.data;
  }

  throw new Error();
};

const fetchListsByUser = async (userId?: string, cursor?: number) => {
  if (!userId) return null;

  const { data, ok } = await borzoi(`/list/user/${userId}`, {
    query: {
      cursor,
      take: 2,
    },
  });
  console.log(data);
  if (ok && data.data) {
    return data.data;
  }

  throw new Error();
};

export const UserPage = () => {
  const { setLoading } = useInterfaceStore();
  const params = useParams();
  const navigate = useNavigate();
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<TUser>(
    [`user/${params.userId}`],
    () => fetchUser(params.userId),
    {
      onError: () => {
        navigate("/");
      },
    }
  );
  const { data: lists, isLoading: isListsLoading } = useInfiniteQuery(
    [`user/${user?.id}/lists`],
    ({ pageParam = 1 }) => fetchListsByUser(user?.id, pageParam),
    {
      getNextPageParam: (x) => {
        return x?.pagination?.nextCursor || null;
      },
    }
  );

  useEffect(() => {
    setLoading("fetching-user", isLoading);

    return () => {
      setLoading("fetching-user", false);
    };
  }, [isLoading]);

  return (
    <div className="bg-stone-100 h-full overflow-auto w-full">
      <div className="w-full h-full  mt-0 pt-4">
        <div className="max-w-[600px] py-3 mx-auto px-4">
          <header className="text-2xl font-medium mb-6">Terrace</header>
          <GoBack />
          {!isLoading && user && (
            <div>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gradient-to-br mb-6 from-white to-stone-400 rounded-full border ring-2 ring-offset-4 ring-stone-300"></div>
                <div className="text-center text-xl">{user.name}</div>
                <div className="text-center text-sm text-stone-600">
                  user since {format(new Date(user.createdAt), "P")}
                </div>
              </div>
              <div className="mt-8">
                {!isListsLoading ? (
                  <>
                    <Card>
                      <h2 className="font-medium text-lg">
                        {user.name}'s lists
                      </h2>
                      <div className="w-full flex flex-col divide-y mt-3">
                        {lists?.pages.map((page, x) =>
                          page.map((list: TList) => (
                            <Link
                              to={`/?listId=${list.id}`}
                              key={`${x}-${list.id}`}
                              className="py-2 !leading-normal px-4 hover:bg-stone-100"
                            >
                              <span>{list.name}</span>
                            </Link>
                          ))
                        )}
                      </div>
                      <div className="flex justify-center mt-5">
                        <button className="button-secondary">Load more</button>
                      </div>
                    </Card>
                  </>
                ) : (
                  <div className="flex flex-row justify-center mt-3">
                    <i className="fal fa-wrench animate-spin text-2xl"></i>
                  </div>
                )}
              </div>
              {/* <div>{JSON.stringify(lists?.pages[0])}</div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
