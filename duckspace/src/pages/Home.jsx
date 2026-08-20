import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";

import HomeSlide from "../components/homeComponents/HomeSlide";
import HomePopupCard from "../components/homeComponents/HomePopupCard";
import HomeExhibition from "../components/homeComponents/HomeExhibition";
import Logo from "../assets/Logo.png"

import { getHome } from "../apis/homeApi";
import { getBanners } from "../apis/bannerApi";

const Home = () => {
  const [home, setHome] = useState(null);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    getHome()
      .then(setHome)
      .catch((error) => console.error("홈 데이터 조회 실패:", error));
  }, []);

  useEffect(() => {
    getBanners()
      .then((data) => {
        const bannerList = data?.banners ?? [];

        setBanners(
          bannerList
            .filter((banner) => banner.active)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
      })
      .catch((error) =>
        console.error("배너 조회 실패:", error)
      );
  }, []);

  
  return (
    <div className="min-h-screen bg-white pb-24">

      {/* 로고 */}
      <div className="flex items-center justify-between px-5 py-3">
        <img
          src={Logo}
          alt="DuckSpace"
          className=" h-[19px] w-[64px]"
        />

      </div>

      {/* 상단 팝업 슬라이드 */}
      <div className="pt-4">
        <HomeSlide banners={banners} />
      </div>

      {/* 다가오는 팝업 */}
      <HomePopupCard popups={home?.upcomingPopups ?? []} />

      {/* 다른 유저 전시장 */}
      <HomeExhibition exhibitions={home?.popularExhibitions ?? []} />

      <NavBar />
    </div>
  );
}

export default Home
