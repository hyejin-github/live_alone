import React, { useEffect, useState } from "react";
import "./JoinMore.scss";
import { v4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { setUserMoreInfo } from "@apis/auth";
import LoadingSpinner from "@images/LoadingSpinner.svg";
import dealCategory from "@constants/dealCategory";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { setMoreInfo } from "@store/ducks/auth/authSlice";
import { getUserMorInfo } from "@store/ducks/auth/authThunk";

function JoinMore() {
  const navigate = useNavigate();
  const [address, setAddress] = useState<string>("");
  const [categorys, setCategorys] = useState<Array<string>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userInfo = useAppSelector(state => state.auth.userInfo);
  const dispatch = useAppDispatch();
  const scriptUrl =
    "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  const open = useDaumPostcodePopup(scriptUrl);
  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setAddress(fullAddress);
  };

  const handleClick = () => {
    open({ onComplete: handleComplete });
  };

  const sendMoreInfo = async () => {
    if (!isLoading) {
      setIsLoading(true);
      const res = await setUserMoreInfo(address, categorys);
      if (res === "SUCCESS") {
        dispatch(setMoreInfo({ area: address, categorys }));
        navigate("/");
      }
      setIsLoading(false);
    }
  };
  const toggleCategorys = (value: string) => {
    const index = categorys.indexOf(value);
    if (index === -1) {
      setCategorys([...categorys, value]);
    } else {
      setCategorys(categorys.filter(category => category !== value));
    }
  };

  const categoryClass = (value: string) => {
    const prefix =
      "categorys-ul__li flex align-center justify-center notoReg fs-11 ellipsis";
    if (categorys.indexOf(value) === -1) {
      return prefix;
    }
    return `${prefix} selected`;
  };

  useEffect(() => {
    (async () => {
      await dispatch(getUserMorInfo());
    })();
  }, []);

  useEffect(() => {
    if (userInfo) {
      setCategorys(userInfo?.categorys || []);
      setAddress(userInfo?.area || "");
    }
  }, [userInfo]);
  return (
    <div className="wrapper">
      <div id="join-more">
        <header className="header">
          <p className="header__title notoBold fs-24">?????? ????????????</p>
          <p className="header__sub-title notoReg fs-16">
            ?????? ????????? ???????????????
            <br />??? ?????? ???????????? ???????????? ??? ????????????.
          </p>
        </header>
        <main className="form">
          <p className="form__title notoBold fs-16">??????</p>
          <input
            type="text"
            className="form__input fs-15 notoReg"
            placeholder="????????? ??????????????????"
            readOnly
            value={address}
          />
          <button
            type="button"
            className="form__btn fs-15 notoReg"
            onClick={handleClick}
          >
            ????????? ?????? ??????
          </button>
          <p className="form__title notoBold fs-16">?????? ????????????</p>
          <ul className="categorys-ul flex">
            {dealCategory.map(category => (
              <button
                type="button"
                className={categoryClass(category)}
                key={v4()}
                onClick={() => toggleCategorys(category)}
              >
                {category}
              </button>
            ))}
          </ul>
          <button
            type="button"
            className="form__btn--submit notoMid fs-16 flex align-center justify-center"
            onClick={sendMoreInfo}
          >
            {isLoading ? (
              <img
                src={LoadingSpinner}
                className="loading-spinner"
                alt="???????????????"
              />
            ) : (
              "??????"
            )}
          </button>
        </main>
        {/* {modalVisible && <AddressModal onClose={() => setModalVisible(false)} />}
         */}
      </div>
    </div>
  );
}

export default JoinMore;
