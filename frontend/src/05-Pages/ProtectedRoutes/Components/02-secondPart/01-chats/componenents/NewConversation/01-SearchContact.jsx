import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../../../../../../../00-app/activeTabSlice";
import SearchBox from "../05- SearchBox";
import { useState } from "react";

import { HiUserAdd } from "react-icons/hi";
import { BsPersonPlusFill } from "react-icons/bs";
import { MdGroupAdd } from "react-icons/md";
import { NewChat } from "./02-NewContact";

export function SearchPageAndAddContactOrGroupButton() {


  
  
  
  const activeTab = useSelector((state) => state.active.activeTab);
  const dispatch = useDispatch();

   
  
  

  const [searchText, setSearchText] = useState("");




  return (
    <>
      <section className="px-4 text-white">
        {/* upper section of search */}
        <section>
          <div
            onClick={() => dispatch(setActiveTab("all"))}
            className=" flex justify-center items-center w-fit text-xl font-semibold"
          >
            <div
              className={`h-12 w-12 rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-700 relative group`}
            >
              <IoArrowBack className="text-2xl inline" />

              {/* text visible ONLY on hover */}
              <p
                className="absolute left-0 top-13
                  bg-white text-black text-sm px-2 py-1 rounded-md
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              >
                back
                {/* pointer-events-none==it disables the mouse interactions for that element.        */}
              </p>
            </div>

            <div>New chat</div>
          </div>

          <div>
            <SearchBox searchText={searchText} setSearchText={setSearchText} />
          </div>
        </section>

        {/* lower section of search result */}
        <section className="max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* buttons of add contact and gropu */}
          <div>
            <div className="">
 
                <div onClick={()=>dispatch(setActiveTab("newchat"))}  className="flex gap-4 items-center cursor-pointer hover:bg-[#202c33]  p-3 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-green-600 flex justify-center items-center">
                        <BsPersonPlusFill className="text-2xl text-black" />
                    </div>

                    <div className="text-white text-lg font-medium">
                        New contact
                    </div>
                </div>


               <div className="flex gap-4 items-center cursor-pointer hover:bg-[#202c33]  p-3 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-green-600 flex justify-center items-center">
                        <MdGroupAdd className="text-2xl text-black" />
                    </div>

                    <div className="text-white text-lg font-medium">
                        New group
                    </div>
                </div>

            </div>

            <div></div>
          </div>
        </section>
      </section>
    </>
  );
}
