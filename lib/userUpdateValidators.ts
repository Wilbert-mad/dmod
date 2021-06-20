import { userData } from '@models/users';

import { isBannerResolvable, user_flags } from './constants';

export interface dataPassed {
  value: any;
  user_premium: number;
  updater?: userData;
  user: userData;
}
type validatorFunctions = (args: dataPassed) => { error: boolean; message?: string };
type Ivalidators = { [key: string]: validatorFunctions };

const DESCRIPTION_MAX_DATA = { PREMIUM: 4000, NORMAL: 2000 };
// const SHOR_DESCRIPTION_MAX_DATA = { PREMIUM: 200, NORMAL: 100 };

const DESCRIPTION_MIN = 80;
// const SHOR_DESCRIPTION_MIN = 20;

// const VANITY_ALLOWED = '_'.split('');
// const VANITY_ALLOWED_REGEXP = /[\w\d@$]{3,50}/i;

// Note: Removes function repeat
const validatorPasses = Object.create(null);
const byPassedPropertys: string[] = ['active', 'pronouns', 'username', 'discriminator', 'avatar'];

byPassedPropertys.forEach(value => {
  validatorPasses[value] = () => {
    return { error: false };
  };
});

const validators: Ivalidators = {
  ...validatorPasses,
  description({ value }) {
    const des = value as string;
    const validation = des.length <= DESCRIPTION_MIN && des.length <= DESCRIPTION_MAX_DATA.NORMAL;
    if (validation) {
      return {
        error: false,
      };
    }

    return {
      error: true,
      message: 'Description length unmeet reslove.',
    };
  },
  banner({ value }) {
    const bannerString = value as string;
    const resolvable = isBannerResolvable(bannerString);

    return {
      error: resolvable,
      ...(resolvable ? {} : { message: 'Banner unresolvable.' }),
    };
  },
  site_flags({ value, user }) {
    const ERROR_MESSAGE = 'Admin user can not be deadmined, by the api nor can they be admined, by the api.';
    // The new flages trying to be updated to.
    const flags = value as number;
    // If the user is currently a admin/dev
    const userIsAdmin = (user.site_flags & user_flags.ADMIN) === user_flags.ADMIN;
    const userIdDev = (user.site_flags & user_flags.DEVELOPER) === user_flags.DEVELOPER;
    // Was admin/dev removed?
    const adminRemoved = (flags & user_flags.ADMIN) !== user_flags.ADMIN;
    const devRemoved = (flags & user_flags.DEVELOPER) !== user_flags.DEVELOPER;

    // Admin check
    if (userIsAdmin && adminRemoved)
      return {
        error: true,
        message: ERROR_MESSAGE,
      };

    // Dev(Admin like) check
    if (userIdDev && devRemoved)
      return {
        error: true,
        message: `${ERROR_MESSAGE} (DEV)`,
      };

    return {
      error: false,
    };
  },
  vanity() {
    // const vanity = value as string;

    /**
     * TODO/NOTE: check if vainity includes valid characters length is 3 or more up to 50
     * * valid: @_.\w\d
     */
    return { error: true, message: 'Vanity updating not avalive yet.' };
  },

  DEFAULT() {
    return {
      error: true,
      message: 'Property validator not found.',
    };
  },
};

type ItypeValidators = { [key: string]: (...args1: any[]) => boolean };
// type ratingProprtyField = [string, (item: any) => boolean];

const typeValidators: ItypeValidators = {
  description: (text: string) => typeof text === 'string',
  active: (active: boolean) => typeof active === 'boolean',
  banner: (text: string) => typeof text === 'string',
  pronouns: (text: string) => typeof text === 'string',
  vanity: (text: string) => typeof text === 'string',
  site_flags: (flags: number) => typeof flags === 'number',
  // ratings: (ratings: ratingData[]) => {
  //   const isArray = Array.isArray(ratings);
  //   if (!isArray) return true;
  //   const propertys: ratingProprtyField[] = [
  //     ['_id', input => typeof input === 'string'],
  //     ['createdAt', input => Object.prototype.toString.call(input) === '[object Date]'],
  //     ['comment', input => typeof input === 'string'],
  //     ['rating', input => typeof input === 'number'],
  //   ];

  //   const AllRatingData = ratings.every(rating => Object.entries(rating).every(([key, value]) => propertys.find(prop => prop[0] === key)[1](value)));
  //   return isArray && AllRatingData;
  // },
  username: (text: string) => typeof text === 'string',
  discriminator: (text: string) => typeof text === 'string',
  avatar: (text: string) => typeof text === 'string',
};

export { validators, typeValidators };
