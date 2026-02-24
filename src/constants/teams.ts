import ansanLogo from '@/assets/logos/ansan.png';
import asanLogo from '@/assets/logos/asan.png';
import bluewingsLogo from '@/assets/logos/bluewings.svg';
import busanLogo from '@/assets/logos/busanipark.png';
import cheonanLogo from '@/assets/logos/cheonan.png';
import chungbukLogo from '@/assets/logos/chfc.png';
import daeguLogo from '@/assets/logos/daegu.png';
import gimhaeLogo from '@/assets/logos/gimhae.svg';
import gimpoLogo from '@/assets/logos/gimpo.svg';
import gyeongnamLogo from '@/assets/logos/gyeongnam.png';
import hwaseongLogo from '@/assets/logos/hwaseong.png';
import jeonnamLogo from '@/assets/logos/jeonnam.png';
import pajuLogo from '@/assets/logos/pajufrontier.svg';
import seongnamLogo from '@/assets/logos/seongnam.png';
import seoulELogo from '@/assets/logos/seouleland.png';
import suwonFcLogo from '@/assets/logos/suwon.png';
import yonginLogo from '@/assets/logos/yongin.png';

export const TEAMS = {
  GIMHAE: 'gimhae',
  CHEONAN: 'cheonan',
  YONGIN: 'yongin',
  SEONGNAM: 'seongnam',
  JEONNAM: 'jeonnam',
  GIMPO: 'gimpo',
  ANSAN: 'ansan',
  SUWON_FC: 'suwon',
  BUSAN: 'busanipark',
  GYEONGNAM: 'gyeongnam',
  SUWON: 'bluewings',
  PAJU: 'pajufrontier',
  ASAN: 'asan',
  DAEGU: 'daegu',
  SEOUL_E: 'seouleland',
  CHUNGBUK: 'chfc',
  HWASEONG: 'hwaseong',
} as const;

export const TEAM_NAMES: Record<string, string> = {
  gimhae: '김해',
  cheonan: '천안',
  yongin: '용인',
  seongnam: '성남',
  jeonnam: '전남',
  gimpo: '김포',
  ansan: '안산',
  suwon: '수원FC',
  busanipark: '부산',
  gyeongnam: '경남',
  bluewings: '수원',
  pajufrontier: '파주',
  asan: '충남아산',
  daegu: '대구',
  seouleland: '서울E',
  chfc: '충북청주',
  hwaseong: '화성',
};

export const TEAM_LOGOS: Record<string, string> = {
  gimhae: gimhaeLogo,
  cheonan: cheonanLogo,
  yongin: yonginLogo,
  seongnam: seongnamLogo,
  jeonnam: jeonnamLogo,
  gimpo: gimpoLogo,
  ansan: ansanLogo,
  suwon: suwonFcLogo,
  busanipark: busanLogo,
  gyeongnam: gyeongnamLogo,
  bluewings: bluewingsLogo,
  pajufrontier: pajuLogo,
  asan: asanLogo,
  daegu: daeguLogo,
  seouleland: seoulELogo,
  chfc: chungbukLogo,
  hwaseong: hwaseongLogo,
};
