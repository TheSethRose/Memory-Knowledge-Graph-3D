import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 8000,
    open: true
  },
  resolve: {
    alias: {
      // Map bare module imports to node_modules
      'stats.js': resolve(__dirname, 'node_modules/stats.js/build/stats.min.js'),
      // Use a custom resolver for three.js to prevent duplicate imports
      'three': {
        find: /^three$/,
        replacement: 'three',
        customResolver(source) {
          // Return empty module if THREE is already loaded via script tag
          return `
            export default window.THREE;
            export const REVISION = window.THREE.REVISION;
            export const MOUSE = window.THREE.MOUSE;
            export const CullFaceNone = window.THREE.CullFaceNone;
            export const CullFaceBack = window.THREE.CullFaceBack;
            export const CullFaceFront = window.THREE.CullFaceFront;
            export const CullFaceFrontBack = window.THREE.CullFaceFrontBack;
            export const BasicShadowMap = window.THREE.BasicShadowMap;
            export const PCFShadowMap = window.THREE.PCFShadowMap;
            export const PCFSoftShadowMap = window.THREE.PCFSoftShadowMap;
            export const VSMShadowMap = window.THREE.VSMShadowMap;
            export const FrontSide = window.THREE.FrontSide;
            export const BackSide = window.THREE.BackSide;
            export const DoubleSide = window.THREE.DoubleSide;
            export const FlatShading = window.THREE.FlatShading;
            export const SmoothShading = window.THREE.SmoothShading;
            export const NoBlending = window.THREE.NoBlending;
            export const NormalBlending = window.THREE.NormalBlending;
            export const AdditiveBlending = window.THREE.AdditiveBlending;
            export const SubtractiveBlending = window.THREE.SubtractiveBlending;
            export const MultiplyBlending = window.THREE.MultiplyBlending;
            export const CustomBlending = window.THREE.CustomBlending;
            export const AddEquation = window.THREE.AddEquation;
            export const SubtractEquation = window.THREE.SubtractEquation;
            export const ReverseSubtractEquation = window.THREE.ReverseSubtractEquation;
            export const MinEquation = window.THREE.MinEquation;
            export const MaxEquation = window.THREE.MaxEquation;
            export const ZeroFactor = window.THREE.ZeroFactor;
            export const OneFactor = window.THREE.OneFactor;
            export const SrcColorFactor = window.THREE.SrcColorFactor;
            export const OneMinusSrcColorFactor = window.THREE.OneMinusSrcColorFactor;
            export const SrcAlphaFactor = window.THREE.SrcAlphaFactor;
            export const OneMinusSrcAlphaFactor = window.THREE.OneMinusSrcAlphaFactor;
            export const DstAlphaFactor = window.THREE.DstAlphaFactor;
            export const OneMinusDstAlphaFactor = window.THREE.OneMinusDstAlphaFactor;
            export const DstColorFactor = window.THREE.DstColorFactor;
            export const OneMinusDstColorFactor = window.THREE.OneMinusDstColorFactor;
            export const SrcAlphaSaturateFactor = window.THREE.SrcAlphaSaturateFactor;
            export const NeverDepth = window.THREE.NeverDepth;
            export const AlwaysDepth = window.THREE.AlwaysDepth;
            export const LessDepth = window.THREE.LessDepth;
            export const LessEqualDepth = window.THREE.LessEqualDepth;
            export const EqualDepth = window.THREE.EqualDepth;
            export const GreaterEqualDepth = window.THREE.GreaterEqualDepth;
            export const GreaterDepth = window.THREE.GreaterDepth;
            export const NotEqualDepth = window.THREE.NotEqualDepth;
            export const MultiplyOperation = window.THREE.MultiplyOperation;
            export const MixOperation = window.THREE.MixOperation;
            export const AddOperation = window.THREE.AddOperation;
            export const NoToneMapping = window.THREE.NoToneMapping;
            export const LinearToneMapping = window.THREE.LinearToneMapping;
            export const ReinhardToneMapping = window.THREE.ReinhardToneMapping;
            export const CineonToneMapping = window.THREE.CineonToneMapping;
            export const ACESFilmicToneMapping = window.THREE.ACESFilmicToneMapping;
            export const CustomToneMapping = window.THREE.CustomToneMapping;
            export const UVMapping = window.THREE.UVMapping;
            export const CubeReflectionMapping = window.THREE.CubeReflectionMapping;
            export const CubeRefractionMapping = window.THREE.CubeRefractionMapping;
            export const EquirectangularReflectionMapping = window.THREE.EquirectangularReflectionMapping;
            export const EquirectangularRefractionMapping = window.THREE.EquirectangularRefractionMapping;
            export const CubeUVReflectionMapping = window.THREE.CubeUVReflectionMapping;
            export const CubeUVRefractionMapping = window.THREE.CubeUVRefractionMapping;
            export const RepeatWrapping = window.THREE.RepeatWrapping;
            export const ClampToEdgeWrapping = window.THREE.ClampToEdgeWrapping;
            export const MirroredRepeatWrapping = window.THREE.MirroredRepeatWrapping;
            export const NearestFilter = window.THREE.NearestFilter;
            export const NearestMipmapNearestFilter = window.THREE.NearestMipmapNearestFilter;
            export const NearestMipmapLinearFilter = window.THREE.NearestMipmapLinearFilter;
            export const LinearFilter = window.THREE.LinearFilter;
            export const LinearMipmapNearestFilter = window.THREE.LinearMipmapNearestFilter;
            export const LinearMipmapLinearFilter = window.THREE.LinearMipmapLinearFilter;
            export const UnsignedByteType = window.THREE.UnsignedByteType;
            export const ByteType = window.THREE.ByteType;
            export const ShortType = window.THREE.ShortType;
            export const UnsignedShortType = window.THREE.UnsignedShortType;
            export const IntType = window.THREE.IntType;
            export const UnsignedIntType = window.THREE.UnsignedIntType;
            export const FloatType = window.THREE.FloatType;
            export const HalfFloatType = window.THREE.HalfFloatType;
            export const UnsignedShort4444Type = window.THREE.UnsignedShort4444Type;
            export const UnsignedShort5551Type = window.THREE.UnsignedShort5551Type;
            export const UnsignedShort565Type = window.THREE.UnsignedShort565Type;
            export const UnsignedInt248Type = window.THREE.UnsignedInt248Type;
            export const AlphaFormat = window.THREE.AlphaFormat;
            export const RGBFormat = window.THREE.RGBFormat;
            export const RGBAFormat = window.THREE.RGBAFormat;
            export const LuminanceFormat = window.THREE.LuminanceFormat;
            export const LuminanceAlphaFormat = window.THREE.LuminanceAlphaFormat;
            export const RGBEFormat = window.THREE.RGBEFormat;
            export const DepthFormat = window.THREE.DepthFormat;
            export const DepthStencilFormat = window.THREE.DepthStencilFormat;
            export const RedFormat = window.THREE.RedFormat;
            export const RedIntegerFormat = window.THREE.RedIntegerFormat;
            export const RGFormat = window.THREE.RGFormat;
            export const RGIntegerFormat = window.THREE.RGIntegerFormat;
            export const RGBIntegerFormat = window.THREE.RGBIntegerFormat;
            export const RGBAIntegerFormat = window.THREE.RGBAIntegerFormat;
            export const RGB_S3TC_DXT1_Format = window.THREE.RGB_S3TC_DXT1_Format;
            export const RGBA_S3TC_DXT1_Format = window.THREE.RGBA_S3TC_DXT1_Format;
            export const RGBA_S3TC_DXT3_Format = window.THREE.RGBA_S3TC_DXT3_Format;
            export const RGBA_S3TC_DXT5_Format = window.THREE.RGBA_S3TC_DXT5_Format;
            export const RGB_PVRTC_4BPPV1_Format = window.THREE.RGB_PVRTC_4BPPV1_Format;
            export const RGB_PVRTC_2BPPV1_Format = window.THREE.RGB_PVRTC_2BPPV1_Format;
            export const RGBA_PVRTC_4BPPV1_Format = window.THREE.RGBA_PVRTC_4BPPV1_Format;
            export const RGBA_PVRTC_2BPPV1_Format = window.THREE.RGBA_PVRTC_2BPPV1_Format;
            export const RGB_ETC1_Format = window.THREE.RGB_ETC1_Format;
            export const RGB_ETC2_Format = window.THREE.RGB_ETC2_Format;
            export const RGBA_ETC2_EAC_Format = window.THREE.RGBA_ETC2_EAC_Format;
            export const RGBA_ASTC_4x4_Format = window.THREE.RGBA_ASTC_4x4_Format;
            export const RGBA_ASTC_5x4_Format = window.THREE.RGBA_ASTC_5x4_Format;
            export const RGBA_ASTC_5x5_Format = window.THREE.RGBA_ASTC_5x5_Format;
            export const RGBA_ASTC_6x5_Format = window.THREE.RGBA_ASTC_6x5_Format;
            export const RGBA_ASTC_6x6_Format = window.THREE.RGBA_ASTC_6x6_Format;
            export const RGBA_ASTC_8x5_Format = window.THREE.RGBA_ASTC_8x5_Format;
            export const RGBA_ASTC_8x6_Format = window.THREE.RGBA_ASTC_8x6_Format;
            export const RGBA_ASTC_8x8_Format = window.THREE.RGBA_ASTC_8x8_Format;
            export const RGBA_ASTC_10x5_Format = window.THREE.RGBA_ASTC_10x5_Format;
            export const RGBA_ASTC_10x6_Format = window.THREE.RGBA_ASTC_10x6_Format;
            export const RGBA_ASTC_10x8_Format = window.THREE.RGBA_ASTC_10x8_Format;
            export const RGBA_ASTC_10x10_Format = window.THREE.RGBA_ASTC_10x10_Format;
            export const RGBA_ASTC_12x10_Format = window.THREE.RGBA_ASTC_12x10_Format;
            export const RGBA_ASTC_12x12_Format = window.THREE.RGBA_ASTC_12x12_Format;
            export const LoopOnce = window.THREE.LoopOnce;
            export const LoopRepeat = window.THREE.LoopRepeat;
            export const LoopPingPong = window.THREE.LoopPingPong;
            export const InterpolateDiscrete = window.THREE.InterpolateDiscrete;
            export const InterpolateLinear = window.THREE.InterpolateLinear;
            export const InterpolateSmooth = window.THREE.InterpolateSmooth;
            export const ZeroCurvatureEnding = window.THREE.ZeroCurvatureEnding;
            export const ZeroSlopeEnding = window.THREE.ZeroSlopeEnding;
            export const WrapAroundEnding = window.THREE.WrapAroundEnding;
            export const TrianglesDrawMode = window.THREE.TrianglesDrawMode;
            export const TriangleStripDrawMode = window.THREE.TriangleStripDrawMode;
            export const TriangleFanDrawMode = window.THREE.TriangleFanDrawMode;
            export const LinearEncoding = window.THREE.LinearEncoding;
            export const sRGBEncoding = window.THREE.sRGBEncoding;
            export const GammaEncoding = window.THREE.GammaEncoding;
            export const RGBEEncoding = window.THREE.RGBEEncoding;
            export const LogLuvEncoding = window.THREE.LogLuvEncoding;
            export const RGBM7Encoding = window.THREE.RGBM7Encoding;
            export const RGBM16Encoding = window.THREE.RGBM16Encoding;
            export const RGBDEncoding = window.THREE.RGBDEncoding;
            export const BasicDepthPacking = window.THREE.BasicDepthPacking;
            export const RGBADepthPacking = window.THREE.RGBADepthPacking;
            export const TangentSpaceNormalMap = window.THREE.TangentSpaceNormalMap;
            export const ObjectSpaceNormalMap = window.THREE.ObjectSpaceNormalMap;
            export const ZoomIn = window.THREE.ZoomIn;
            export const ZoomOut = window.THREE.ZoomOut;
            export const * from 'three';
          `;
        }
      },
      '3d-force-graph': resolve(__dirname, 'node_modules/3d-force-graph/dist/3d-force-graph.min.js'),
      'three-spritetext': resolve(__dirname, 'node_modules/three-spritetext/dist/three-spritetext.min.js'),
      'd3': resolve(__dirname, 'node_modules/d3/dist/d3.min.js')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
});
