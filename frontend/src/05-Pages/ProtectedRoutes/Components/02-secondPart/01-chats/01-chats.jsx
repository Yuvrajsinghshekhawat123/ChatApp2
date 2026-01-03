 import { MdOutlineAddComment } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import SearchBox from "./componenents/05- SearchBox";
import { All } from "./componenents/01-All";
import { Unread } from "./componenents/02-unRead";
import { Favourites } from "./componenents/03-Favourites";
import { Groups } from "../02-groups";
import { SearchPageAndAddContactOrGroupButton } from "./componenents/NewConversation/01-SearchContact";
import { NewChat } from "./componenents/NewConversation/02-NewContact";
import { setActiveTab } from "../../../../../00-app/activeTabSlice";

export function Chats({ searchText, setSearchText }) {
  const activeTab = useSelector((state) => state.active.activeTab);
  const dispatch = useDispatch();

  /* 🔁 Slide animation config */
  const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  return (
    <section className="h-screen relative overflow-hidden">

      {/* 🔥 SLIDING SCREENS */}
      <AnimatePresence mode="wait">
        {activeTab === "searchcontact" && (
          <motion.div
            key="searchcontact"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 "
          >
            <SearchPageAndAddContactOrGroupButton />
          </motion.div>
        )}

        {activeTab === "newchat" && (
          <motion.div
            key="newchat"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 "
          >
            <NewChat />
          </motion.div>
        )}
      </AnimatePresence>








      {/* 🧱 MAIN CHAT LAYOUT */}
      {activeTab !== "searchcontact" && activeTab !== "newchat" && (
        <section className="h-full flex flex-col ">

          {/* HEADER */}
          <section className="shrink-0 px-6">
            <div className="w-full flex justify-between ">
              <h1 className="text-xl md:text-4xl font-bold text-white">
                Connectly
              </h1>

              <div
                onClick={() => dispatch(setActiveTab("searchcontact"))}
                className="flex items-center pt-2 cursor-pointer"
              >
                <MdOutlineAddComment className="text-3xl" />
              </div>
            </div>

            <SearchBox
              searchText={searchText}
              setSearchText={setSearchText}
            />

            {/* TABS */}
            <div className="flex gap-2 text-[#989a9c] mt-2">
              {["all", "unread", "favourites", "groups"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => dispatch(setActiveTab(tab))}
                  className={`rounded-3xl border border-[#353637] px-3 py-1 font-bold text-lg
                  ${
                    activeTab === tab
                      ? "bg-green-800 text-white"
                      : "hover:bg-[#353637]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* BODY */}
          <section className="flex-1 overflow-y-auto mt-2 text-white custom-scrollbar">
            {activeTab === "all" && <All />}
            {activeTab === "unread" && <Unread />}
            {activeTab === "favourites" && <Favourites />}
            {activeTab === "groups" && <Groups />}
          </section>
        </section>
      )}





    </section>
  );
}
